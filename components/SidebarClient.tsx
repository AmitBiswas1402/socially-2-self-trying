"use client";

import SidebarItem from "./SidebarItem";
import { UserButton, useUser } from "@clerk/nextjs";
import { Home, PlusSquare, Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SidebarItemType = {
  label: string;
  href: string;
  icon: "home" | "create" | "notifications" | "profile";
};

const ICON_MAP = {
  home: Home,
  create: PlusSquare,
  notifications: Bell,
  profile: User
};

const SidebarClient = ({
  items,
}: {
  items: readonly SidebarItemType[];
}) => {
  const { user } = useUser();

  return (
    <aside className="flex h-screen w-64 flex-col border-r px-4 py-6">
      {/* Logo */}
      <Link href={'/'} className="flex items-center gap-2 mb-6 px-7">
        <Image src={'/logo.svg'} alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold tracking-tight">Picsta Social</span>
      </Link>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {items.map(({ label, href, icon }) => {
          const Icon = ICON_MAP[icon];

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
              @{user?.username ??
                user?.primaryEmailAddress?.emailAddress.split("@")[0]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarClient;
