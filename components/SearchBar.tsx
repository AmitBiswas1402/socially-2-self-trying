"use client";

import { useState, useTransition } from "react";
import { searchUsers } from "@/actions/search.action";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);

    startTransition(async () => {
      if (!value.trim()) {
        setResults([]);
        return;
      }

      const res = await searchUsers(value);
      setResults(res);
    });
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-lg border bg-black shadow-lg z-50">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800"
            >
              <img
                src={user.image ?? "/avatar.png"}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm text-white font-medium">
                  {user.username}
                </p>
                {user.name && (
                  <p className="text-xs text-zinc-400">
                    {user.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
