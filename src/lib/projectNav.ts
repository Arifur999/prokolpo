import type { IconName } from "@/components/shared/icon/iconPaths";
import type { IProjectSummary } from "@/types/project.types";
import { menusFor, type MenuKey } from "./projectPlan";

// The project sidebar (board Main): fixed groups, plus the sales and partner pages the
// project's kind and ownership call for. `page` is the path under /projects/{id}.
export type NavKey =
  | "overview"
  | "expenses"
  | "suppliers"
  | "contractors"
  | "accounts"
  | "partners"
  | "units"
  | "plots"
  | "sales"
  | "customers"
  | "farmSales"
  | "bizSales"
  | "reports"
  | "members"
  | "activity"
  | "settings";
export type NavItem = { key: NavKey; page: string; icon: IconName };
export type NavGroup = { key: "main" | "money" | "joint" | "sales" | "farm" | "shop" | "other"; items: NavItem[] };

const MENU_ITEMS: Record<MenuKey, NavItem> = {
  partners: { key: "partners", page: "partners", icon: "users" },
  units: { key: "units", page: "units", icon: "building" },
  plots: { key: "plots", page: "units", icon: "grid" },
  sales: { key: "sales", page: "sales", icon: "key" },
  customers: { key: "customers", page: "customers", icon: "user" },
  buyers: { key: "customers", page: "customers", icon: "user" },
  farmSales: { key: "farmSales", page: "farm-sales", icon: "egg" },
  bizSales: { key: "bizSales", page: "biz-sales", icon: "shop" },
};

export const projectNav = (project: Pick<IProjectSummary, "kind" | "ownership">): NavGroup[] => {
  const extras = menusFor(project).map((menu) => MENU_ITEMS[menu]);
  const groups: NavGroup[] = [
    {
      key: "main",
      items: [
        { key: "overview", page: "", icon: "dashboard" },
        { key: "expenses", page: "expenses", icon: "receipt" },
      ],
    },
    {
      key: "money",
      items: [
        { key: "suppliers", page: "suppliers", icon: "store" },
        { key: "contractors", page: "contractors", icon: "hardHat" },
        { key: "accounts", page: "accounts", icon: "wallet" },
      ],
    },
  ];
  // A joint project's menus sit under "যৌথ"; a farm's or a shop's under its own name (boards
  // FarmSales, BizSales).
  const own = project.kind === "FARM" ? "farm" : project.kind === "BUSINESS" ? "shop" : "sales";
  if (extras.length) groups.push({ key: project.ownership === "PARTNERSHIP" ? "joint" : own, items: extras });
  groups.push({
    key: "other",
    items: [
      { key: "reports", page: "reports", icon: "barChart" },
      { key: "members", page: "members", icon: "userPlus" },
      { key: "activity", page: "activity", icon: "undo" },
      { key: "settings", page: "settings", icon: "sliders" },
    ],
  });
  return groups;
};
