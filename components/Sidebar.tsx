import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/users.action";
import SidebarClient from "./SidebarClient";

const Sidebar = async () => {
  const user = await currentUser();

  const username = user?.username ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  const SIDEBAR_ITEMS = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Create", href: "/create", icon: "create" },
    { label: "Notifications", href: "/notifications", icon: "notifications" },
    { label: "Profile", href: `/profile/${username}`, icon: "profile" },
  ] as const;

  if (user) {
    await syncUser();
  }

  return <SidebarClient items={SIDEBAR_ITEMS} />;
};

export default Sidebar;
