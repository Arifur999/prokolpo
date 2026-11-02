import type { IconName } from "@/components/shared/icon/iconPaths";

export type AdminNavKey = "dashboard" | "users" | "projects" | "support" | "announcements" | "audit" | "settings";

// The admin panel's pages, in the sidebar's order (board AdminDashboard).
export const ADMIN_NAV: { key: AdminNavKey; href: string; icon: IconName }[] = [
  { key: "dashboard", href: "/admin", icon: "dashboard" },
  { key: "users", href: "/admin/users", icon: "users" },
  { key: "projects", href: "/admin/projects", icon: "folders" },
  { key: "support", href: "/admin/support", icon: "lifeBuoy" },
  { key: "announcements", href: "/admin/announcements", icon: "megaphone" },
  { key: "audit", href: "/admin/audit", icon: "scroll" },
  { key: "settings", href: "/admin/settings", icon: "settings" },
];

// The dashboard is current only on its own page; the others also cover their sub-pages.
export const isCurrent = (href: string, pathname: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
