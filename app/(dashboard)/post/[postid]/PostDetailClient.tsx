"use client";

import { useUser } from "@clerk/nextjs";
import {
  createComment,
  deleteComment,
  deletePost,
  toggleLike,
} from "@/actions/posts.action";
import { HeartIcon, MessageCircleIcon, SendIcon, X } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteAlertDialog } from "@/components/DeleteAlertDialogBox";

interface PostDetailClientProps {
  post: any;
  dbUserId: string | null;
}

const PostDetailClient = ({ post, dbUserId }: PostDetailClientProps) => {
  const { user } = useUser();

  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [hasLiked, setHasLiked] = useState<boolean>(
    post.likes.some((like: any) => like.userId === dbUserId),
  );
  const [optimisticLikes, setOptimisticLikes] = useState<number>(
    post._count.likes,
  );

  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  /* ---------------- LIKE ---------------- */
  const handleLike = async () => {
    if (!user || isLiking) return;

    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch {
      setHasLiked(post.likes.some((like: any) => like.userId === dbUserId));
      setOptimisticLikes(post._count.likes);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  /* ---------------- ADD COMMENT ---------------- */
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

  /* ---------------- DELETE POST ---------------- */
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

  /* ---------------- DELETE COMMENT ---------------- */
  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete || isDeletingComment) return;

    try {
      setIsDeletingComment(true);
      const res = await deleteComment(commentToDelete, post.id);
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
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] bg-black border border-zinc-800">
        {/* LEFT IMAGE */}
        <div className="bg-black flex items-center justify-center">
          <img
            src={post.image}
            alt="Post"
            className="max-h-[80vh] w-full object-contain"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col border-l border-zinc-800">
          {/* HEADER */}
          <div className="flex items-center justify-between gap-3 p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.image || "/avatar.png"} />
              </Avatar>
              <span className="font-semibold text-white">
                {post.author.username}
              </span>
            </div>

            {dbUserId === post.author.id && (
              <DeleteAlertDialog
                isDeleting={isDeleting}
                onDelete={handleDeletePost}
              />
            )}
          </div>

          {/* CAPTION */}
          <div className="p-4 flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.image || "/avatar.png"} />
            </Avatar>
            <div className="text-sm text-white">
              <span className="font-semibold mr-2">{post.author.username}</span>
              {post.content}
            </div>
          </div>

          {/* COMMENTS */}
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            {post.comments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.author.image || "/avatar.png"} />
                </Avatar>

                <div className="flex-1">
                  <div className="text-sm text-white">
                    <span className="font-semibold mr-2">
                      {comment.author.username}
                    </span>
                    {comment.content}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </div>
                </div>

                {dbUserId === comment.author.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-red-500"
                    onClick={() => setCommentToDelete(comment.id)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="p-4 border-t border-zinc-800 space-y-2">
            {/* ACTION ROW */}
            <div className="flex items-center gap-5">
              {/* LIKE */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className={`p-0 ${
                  hasLiked ? "text-red-500" : "text-white hover:text-red-500"
                }`}
              >
                <HeartIcon
                  className={`h-6 w-6 ${hasLiked ? "fill-current" : ""}`}
                />
              </Button>

              {/* COMMENT */}
              <Button
                variant="ghost"
                size="icon"
                className="p-0 text-white hover:text-zinc-300"
              >
                <MessageCircleIcon className="h-6 w-6" />
              </Button>
            </div>

            {/* TIME */}
            <div className="text-xs text-zinc-400">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </div>
          </div>

          {/* ADD COMMENT */}
          {user && (
            <div className="border-t border-zinc-800 p-3 flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none bg-black border-0 text-white"
              />
              <Button
                variant="ghost"
                disabled={!newComment.trim() || isCommenting}
                onClick={handleAddComment}
                className="text-blue-500"
              >
                <SendIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

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
  );
};

export default PostDetailClient;
