"use client";

import { createPost } from "@/actions/posts.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";

const CreatePost = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !imageURL) {
      toast.error("Image and caption required");
      return;
    }

    setIsPosting(true);
    try {
      const res = await createPost(content, imageURL);
      if (res?.success) {
        setContent("");
        setImageURL("");
        toast.success("Post shared");
      }
    } catch {
      toast.error("Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card
        className="
          rounded-2xl
          bg-linear-to-br from-zinc-900/90 to-zinc-950
          border border-zinc-800
          shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          backdrop-blur
        "
      >
        <div className="p-6 space-y-5">
          {/* Top */}
          <div className="flex gap-4">
            <Avatar className="h-11 w-11 ring-2 ring-zinc-700">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>

            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
              className="
                flex-1
                resize-none
                bg-transparent
                border-0
                p-2
                text-lg
                text-white
                placeholder:text-zinc-500
                focus-visible:ring-0
                min-h-[80px]
              "
            />
          </div>

          {/* Image preview */}
          {imageURL && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800">
              <img
                src={imageURL}
                alt="preview"
                className="w-full max-h-[420px] object-cover"
              />
              <button
                onClick={() => setImageURL("")}
                className="absolute top-3 right-3 bg-black/70 text-white p-1.5 rounded-full hover:scale-105 transition"
              >
                <XIcon size={16} />
              </button>
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              className="
                text-zinc-400 hover:text-white
                hover:bg-zinc-800/60
                rounded-full
                px-3
              "
              onClick={() =>
                setImageURL(
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
                )
              }
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photo
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !imageURL || isPosting}
              className="
                rounded-full
                px-6 py-2
                bg-blue-600
                hover:bg-blue-500
                text-white
                font-medium
                disabled:opacity-40
                transition-all
              "
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Sharing
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatePost;
