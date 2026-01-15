"use client";

import Link from "next/link";
import { Home, PlusSquare, Bell } from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Create", href: "/create", icon: PlusSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

const Sidebar = () => {
  return (
    <aside className="w-64 border-r px-4 py-6">
      {/* Logo */}
      <div className="mb-8 px-2 text-2xl font-semibold">Logo</div>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {SIDEBAR_ITEMS.map(({ label, href, icon: Icon }) => (
          <SidebarItem key={label} href={href} label={label} icon={<Icon />} />
        ))}
      </nav>
    </aside>
  );
};

const SidebarItem = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg px-3 py-3 text-sm transition hover:border-white hover:border-0"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;
