"use client";

import { useUser } from "@clerk/nextjs";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface PostDetailClientProps {
  post: any;
}

const PostDetailClient = ({ post }: PostDetailClientProps) => {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] bg-black border border-zinc-800">
        {/* LEFT — IMAGE */}
        <div className="bg-black flex items-center justify-center">
          <img
            src={post.image}
            alt="Post"
            className="max-h-[80vh] w-full object-contain"
          />
        </div>

        {/* RIGHT — INFO */}
        <div className="flex flex-col border-l border-zinc-800">
          {/* HEADER */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.image || "/avatar.png"} />
            </Avatar>
            <span className="font-semibold text-white">
              {post.author.username}
            </span>
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
            {post.comments.length > 0 ? (
              post.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={comment.author.image || "/avatar.png"} />
                  </Avatar>
                  <div className="text-sm text-white">
                    <span className="font-semibold mr-2">
                      {comment.author.username}
                    </span>
                    {comment.content}
                    <div className="text-xs text-zinc-400 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-400 text-center py-4">
                No comments yet
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="p-4 border-t border-zinc-800 space-y-2">
            <div className="flex gap-4">
              <HeartIcon className="size-5 text-white" />
              <MessageCircleIcon className="size-5 text-white" />
            </div>

            <div className="text-sm text-white font-medium">
              {post._count.likes} likes
            </div>

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
                disabled={!newComment.trim()}
                className="text-blue-500"
              >
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailClient;
