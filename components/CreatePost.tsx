"use client";

import {
  createComment,
  deleteComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/posts.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import {
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
  X,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { DeleteAlertDialog } from "./DeleteAlertDialogBox";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

const PostCard = ({
  post,
  dbUserId,
}: {
  post: Post;
  dbUserId: string | null;
}) => {
  const { user } = useUser();

  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === dbUserId)
  );
  const [optimisticLikes, setOptimisticLikes] = useState(
    post._count.likes
  );
  const [showComments, setShowComments] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(
    null
  );
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked(!hasLiked);
      setOptimisticLikes((p) => p + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch {
      setHasLiked(
        post.likes.some((like) => like.userId === dbUserId)
      );
      setOptimisticLikes(post._count.likes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const res = await createComment(post.id, newComment);
      if (res?.success) {
        toast.success("Comment posted");
        setNewComment("");
      }
    } catch {
      toast.error("Failed to comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await deletePost(post.id);
      if (!res.success) throw new Error();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete || isDeletingComment) return;
    try {
      setIsDeletingComment(true);
      const res = await deleteComment(commentToDelete);
      if (!res.success) throw new Error();
      toast.success("Comment deleted");
      setCommentToDelete(null);
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeletingComment(false);
    }
  };

  return (
    <Card
      className="
        rounded-2xl
        bg-linear-to-br from-zinc-900/90 to-zinc-950
        border border-zinc-800
        shadow-[0_16px_50px_rgba(0,0,0,0.55)]
        backdrop-blur
        overflow-hidden
      "
    >
      <div className="p-6 space-y-4">
        {/* HEADER */}
        <div className="flex gap-4">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="h-10 w-10 ring-2 ring-zinc-700">
              <AvatarImage
                src={post.author.image ?? "/avatar.png"}
              />
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="truncate">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="font-semibold text-white"
                >
                  {post.author.fullName ??
                    post.author.username}
                </Link>
                <div className="text-sm text-zinc-400">
                  @{post.author.username} ·{" "}
                  {formatDistanceToNow(
                    new Date(post.createdAt)
                  )}{" "}
                  ago
                </div>
              </div>

              {dbUserId === post.author.id && (
                <DeleteAlertDialog
                  isDeleting={isDeleting}
                  onDelete={handleDeletePost}
                />
              )}
            </div>

            <p className="mt-2 text-sm text-zinc-100 wrap-break-words">
              {post.content}
            </p>
          </div>
        </div>

        {/* IMAGE */}
        {post.image && (
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <img
              src={post.image}
              alt="Post"
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center gap-4 pt-2">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${
                hasLiked
                  ? "text-red-500"
                  : "text-zinc-400 hover:text-red-500"
              }`}
            >
              <HeartIcon
                className={`size-5 ${
                  hasLiked ? "fill-current" : ""
                }`}
              />
              {optimisticLikes}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 gap-2"
              >
                <HeartIcon className="size-5" />
                {optimisticLikes}
              </Button>
            </SignInButton>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 gap-2 hover:text-blue-500"
            onClick={() => setShowComments((p) => !p)}
          >
            <MessageCircleIcon className="size-5" />
            {post.comments.length}
          </Button>
        </div>

        {/* COMMENTS */}
        {showComments && (
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      comment.author.image ??
                      "/avatar.png"
                    }
                  />
                </Avatar>

                <div className="flex-1">
                  <div className="text-sm text-zinc-400">
                    <span className="font-medium text-white">
                      {comment.author.name}
                    </span>{" "}
                    @{comment.author.username} ·{" "}
                    {formatDistanceToNow(
                      new Date(comment.createdAt)
                    )}{" "}
                    ago
                  </div>
                  <p className="text-sm text-zinc-100 wrap-break-words">
                    {comment.content}
                  </p>
                </div>

                {dbUserId === comment.author.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-red-500"
                    onClick={() =>
                      setCommentToDelete(comment.id)
                    }
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}

            {user ? (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.imageUrl || "/avatar.png"}
                  />
                </Avatar>

                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) =>
                      setNewComment(e.target.value)
                    }
                    className="resize-none bg-zinc-900 border-zinc-800 text-white"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={
                        !newComment.trim() || isCommenting
                      }
                      className="gap-2"
                    >
                      <SendIcon className="size-4" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="gap-2"
                  >
                    <LogInIcon className="size-4" />
                    Sign in to comment
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        )}

        {commentToDelete && (
          <DeleteAlertDialog
            isDeleting={isDeletingComment}
            onDelete={handleConfirmDeleteComment}
            onClose={() => setCommentToDelete(null)}
            hideTrigger
            open
          />
        )}
      </div>
    </Card>
  );
};

export default PostCard;
