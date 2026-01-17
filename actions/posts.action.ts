"use server"

import { db } from "@/db";
import { getDBUserId } from "./users.action"
import { comments, likes, posts, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";

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
        const postsWithAuthor = await db.select({
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

        const allComments = await db.select({
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

        const likesCount = await db.select({
            postId: likes.postId,
            count: sql<number>`count(*)`.as("count"),
        })
            .from(likes)
            .groupBy(likes.postId);

        const postsData = postsWithAuthor.map((post) => {
            const postLikes = allLiskes.filter((like) => like.postId === post.id).map((like) => ({ userId: like.userId }));

            const postComments = allComments.filter((comment) => comment.postId === post.id)
                .map((comment) => ({
                    id: comment.id,
                    content: comment.content,
                    userId: comment.userId,
                    createdAt: comment.createdAt ?? new Date(),
                    author: comment.author,
                }));

            const likesCountForPost = likesCount.find(
                (lc) => lc.postId === post.id
            )?.count ?? 0;

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
        })

        return postsData;
    } catch (error) {
        console.log("Error in getPosts", error);
        throw new Error("Failed to fetch posts");
    }
}