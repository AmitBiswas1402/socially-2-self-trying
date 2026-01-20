"use client";

import { createPost } from "@/actions/posts.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  ImageIcon,
  Loader2Icon,
  SendIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";

const CreatePost = () => {
  const { user } = useUser();

  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cloudinary upload 
  const uploadImage = async (file: File) => {
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: reader.result }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setImageURL(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Post
  const handleSubmit = async () => {
    if (!content.trim() || !imageURL) {
      toast.error("Image and caption required");
      return;
    }

    setIsPosting(true);
    try {
      const result = await createPost(content, imageURL);

      if (result?.success) {
        setContent("");
        setImageURL("");
        setShowImageUpload(false);
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
                min-h-20
              "
            />
          </div>

          {/* Image upload / preview */}
          {(showImageUpload || imageURL) && (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
              {imageURL ? (
                <>
                  <Image
                    src={imageURL}
                    alt="Preview"
                    width={800}
                    height={800}
                    className="w-full max-h-105 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImageURL("");
                      setShowImageUpload(false);
                    }}
                    className="
                      absolute top-3 right-3
                      bg-black/70 text-white
                      p-1.5 rounded-full
                      hover:scale-105 transition
                    "
                  >
                    <XIcon size={16} />
                  </button>
                </>
              ) : (
                <label
                  className="
                    flex flex-col items-center justify-center
                    h-55
                    cursor-pointer
                    text-zinc-400
                    hover:text-white
                    transition
                  "
                >
                  {isUploading ? (
                    <Loader2Icon className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 mb-2" />
                      <span className="text-sm">
                        Click to upload image
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageSelect(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="
                text-zinc-400 hover:text-white
                hover:bg-zinc-800/60
                rounded-full
                px-3
              "
              onClick={() => setShowImageUpload(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photo
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                !content.trim() ||
                !imageURL ||
                isPosting ||
                isUploading
              }
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
