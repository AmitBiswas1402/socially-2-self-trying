import Link from "next/link";

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
  
  export default SidebarItem;