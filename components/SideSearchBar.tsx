"use client";

import { Home, Search, PlusSquare, Bell } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import SearchDrawer from "./SearchDrawer";

const Sidebar = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <aside className="w-64 border-r px-4 py-6 flex flex-col">
        <div className="mb-8 text-2xl font-semibold">Picsta Social</div>

        <nav className="space-y-2">
          <Link href="/" className="sidebar-item">
            <Home className="size-5" />
            Home
          </Link>

          {/* SEARCH BUTTON */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sidebar-item w-full text-left"
          >
            <Search className="size-5" />
            Search
          </button>

          <Link href="/create" className="sidebar-item">
            <PlusSquare className="size-5" />
            Create
          </Link>

          <Link href="/notifications" className="sidebar-item">
            <Bell className="size-5" />
            Notifications
          </Link>
        </nav>
      </aside>

      {/* SEARCH DRAWER */}
      <SearchDrawer
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </>
  );
};

export default Sidebar;
