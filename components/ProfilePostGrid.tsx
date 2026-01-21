"use client";

import Link from "next/link";

interface ProfilePostGridProps {
  posts: {
    id: string;
    image: string | null;
  }[];
}

const ProfilePostGrid = ({ posts }: ProfilePostGridProps) => {
  return (
    <div
      className="
        grid
        grid-cols-3
        gap-0.5
        md:gap-1
      "
    >
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`} // optional route
          className="group relative aspect-square bg-black"
        >
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="
                h-full
                w-full
                object-cover
                transition
                duration-200
                group-hover:brightness-90
              "
            />
          )}

          {/* Hover overlay (Instagram-style) */}
          <div
            className="
              absolute inset-0
              bg-black/40
              opacity-0
              group-hover:opacity-100
              transition
              flex items-center justify-center
              text-white text-sm font-medium
            "
          >
            View
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProfilePostGrid;
