"use client";

import SidebarItem from "./SidebarItem";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home, PlusSquare, Bell, User, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { searchUsers } from "@/actions/search.action";

type SidebarItemType = {
  label: string;
  href: string;
  icon: "home" | "create" | "notifications" | "profile" | "search";
};

const ICON_MAP = {
  home: Home,
  create: PlusSquare,
  notifications: Bell,
  profile: User,
  search: Search,
};

const SidebarClient = ({
  items,
}: {
  items: readonly SidebarItemType[];
}) => {
  const { user } = useUser();

  // 🔍 Search drawer state
  const [searchOpen, setSearchOpen] = useState(false);
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
    setSearchOpen(false);
  };

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r px-4 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-6 px-7">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span className="text-xl font-bold tracking-tight">
            Picsta Social
          </span>
        </Link>

        {/* Menu */}
        <nav className="flex flex-col gap-2">
          {items.map(({ label, href, icon }) => {
            const Icon = ICON_MAP[icon];

            if (icon === "search") {
              return (
                <button
                  key={label}
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-4 rounded-lg px-3 py-3 text-sm hover:bg-zinc-900"
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              );
            }

            return (
              <SidebarItem
                key={label}
                href={href}
                label={label}
                icon={<Icon />}
              />
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="mt-auto">
          <div className="my-4 border-t" />

          <div className="flex items-center gap-3 px-2">
            <UserButton
              appearance={{
                elements: { avatarBox: "h-9 w-9" },
              }}
            />

            <div className="flex flex-col text-sm">
              <span className="font-medium">
                {user?.fullName ?? "User"}
              </span>
              <span className="text-xs text-gray-500">
                @
                {user?.username ??
                  user?.primaryEmailAddress?.emailAddress.split("@")[0]}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 🔍 SEARCH DRAWER */}
      <Drawer open={searchOpen} onOpenChange={setSearchOpen} direction="left">
        <DrawerContent className="h-full w-80 rounded-none border-r bg-black">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>Search</DrawerTitle>

            {/* ❌ Clear / Close */}
            <button
              onClick={clearSearch}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerHeader>

          <div className="px-4 space-y-4">
            <Input
              placeholder="Search users..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <div className="space-y-2">
              {results.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.username}`}
                  onClick={clearSearch}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800"
                >
                  <img
                    src={u.image ?? "/avatar.png"}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {u.username}
                    </p>
                    {u.name && (
                      <p className="text-xs text-zinc-400">
                        {u.name}
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
    </>
  );
};

export default SidebarClient;
