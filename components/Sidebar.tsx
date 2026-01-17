import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/users.action";
import SidebarClient from "./SidebarClient";

const SIDEBAR_ITEMS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Create", href: "/create", icon: "create" },
  { label: "Notifications", href: "/notifications", icon: "notifications" },
] as const;

async function Sidebar() {
  const user = await currentUser();

  if (user) {
    await syncUser();
  }

  return <SidebarClient items={SIDEBAR_ITEMS} />;
}

export default Sidebar;
