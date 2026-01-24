"use client";

import { useState, useTransition } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { searchUsers } from "@/actions/search.action";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDrawer = ({ open, onOpenChange }: SearchDrawerProps) => {
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
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent className="h-full w-80 rounded-none border-r bg-black">
        <DrawerHeader>
          <DrawerTitle>Search</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          <Input
            placeholder="Search users..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="space-y-2">
            {results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800"
              >
                <img
                  src={user.image ?? "/avatar.png"}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">
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

            {query && results.length === 0 && (
              <p className="text-sm text-zinc-500">
                No users found
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SearchDrawer;
