"use client";

import { useState, useTransition } from "react";
import { searchUsers } from "@/actions/search.action";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { X } from "lucide-react";

interface SearchBarProps {
  onClose?: () => void; // ✅ OPTIONAL
}

const SearchBar = ({ onClose }: SearchBarProps) => {
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

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* HEADER (optional close button for sidebar/modal) */}
      {onClose && (
        <div className="flex items-center justify-center relative mb-4">
          <h2 className="text-lg font-semibold text-white">Search</h2>
          <button
            onClick={onClose}
            className="absolute right-0 text-zinc-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* SEARCH INPUT */}
      <div className="relative">
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-10"
        />

        {/* CLEAR ❌ INSIDE INPUT */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-zinc-800 bg-black shadow-lg z-50 overflow-hidden">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              onClick={() => onClose?.()}
              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition"
            >
              <img
                src={user.image ?? "/avatar.png"}
                alt={user.username}
                className="h-9 w-9 rounded-full"
              />
              <div className="leading-tight">
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
