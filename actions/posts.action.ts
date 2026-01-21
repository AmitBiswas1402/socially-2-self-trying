"use server";

import { db } from "@/db";
import { getDBUserId } from "./users.action";
import { comments, likes, notifications, posts, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDBUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const [post] = await db
      .insert(posts)
      .values({ content, image, authorId: userId })
      .returning();

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.log("Error in createPost", error);
    return { success: false, error: "Error creating post" };
  }
}

export async function getPosts() {
  try {
    const postsWithAuthor = await db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          fullName: users.name,
          image: users.image,
        },
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .orderBy(desc(posts.createdAt));

    const allLiskes = await db.select().from(likes);

    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.authorId,
        createdAt: comments.createdAt,
        postId: comments.postId,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          fullName: users.name,
          image: users.image,
        },
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.authorId));

    const likesCount = await db
      .select({
        postId: likes.postId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(likes)
      .groupBy(likes.postId);

    const postsData = postsWithAuthor.map((post) => {
      const postLikes = allLiskes
        .filter((like) => like.postId === post.id)
        .map((like) => ({ userId: like.userId }));

      const postComments = allComments
        .filter((comment) => comment.postId === post.id)
        .map((comment) => ({
          id: comment.id,
          content: comment.content,
          userId: comment.userId,
          createdAt: comment.createdAt ?? new Date(),
          author: comment.author,
        }));

      const likesCountForPost =
        likesCount.find((lc) => lc.postId === post.id)?.count ?? 0;

      return {
        id: post.id,
        content: post.content ?? "",
        image: post.image,
        createdAt: post.createdAt ?? new Date(),
        updatedAt: post.updatedAt,
        author: post.author,
        likes: postLikes,
        comments: postComments,
        _count: {
          likes: Number(likesCountForPost),
        },
      };
    });

    return postsData;
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDBUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const existing = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
      .limit(1);

    if (existing.length) {
      await db
        .delete(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    } else {
      await db.transaction(async (tx) => {
        await tx.insert(likes).values({ postId, userId });

        const [p] = await tx
          .select({ authorId: posts.authorId })
          .from(posts)
          .where(eq(posts.id, postId))
          .limit(1);

        if (p && p.authorId !== userId) {
          await tx.insert(notifications).values({
            type: "LIKE",
            userId: p.authorId,
            creatorId: userId,
            postId,
          });
        }
      });
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete post:", message);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDBUserId();
    if (!userId) return { success: false, error: "Unauthorized" };

    const [comment] = await db
      .insert(comments)
      .values({
        content,
        postId,
        authorId: userId,
      })
      .returning();

    const [p] = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (p && p.authorId !== userId) {
      await db.insert(notifications).values({
        type: "COMMENT",
        userId: p.authorId,
        creatorId: userId,
        postId,
        commentId: comment.id,
      });
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    return { success: true, comment };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete post:", message);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDBUserId();

    const [post] = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) return { success: false, error: "Post not found" };

    if (post.authorId !== userId)
      return { success: false, error: "Unauthorized - no delete permission" };

    await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, userId)));

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete post:", message);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function deleteComment(commentId: string, postId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user) return { success: false, error: "User not found" };

    await db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.authorId, user.id)));

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.log("Delete comment error", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

export async function getPostById(postId: string) {
  const postRows = await db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.image,
      createdAt: posts.createdAt,

      author: {
        id: users.id,
        username: users.username,
        image: users.image,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!postRows.length) return null;
  const post = postRows[0];

  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      author: {
        id: users.id,
        username: users.username,
        image: users.image,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

  const likesCount = await db
    .select({ count: likes.id })
    .from(likes)
    .where(eq(likes.postId, postId));

  return {
    ...post,
    comments: postComments,
    _count: {
      likes: likesCount.length,
    },
  };
}
