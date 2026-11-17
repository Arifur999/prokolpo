import type { IconName } from "@/components/shared/icon/iconPaths";
import type { IProjectSummary } from "@/types/project.types";
import { menusFor } from "./projectPlan";

// The project sidebar (board Main, design v2): a few single links and collapsible groups of
// sub-pages, split by the "আরও" label. Which nodes show follows the project's kind and
// ownership (FarmSales and BizSales show the reduced menu). `page` is the path under
// /projects/{id}; `query` pins a tab of that page.

export type NavNodeKey =
  | "overview"
  | "balance"
  | "expense"
  | "shareholder"
  | "loan"
  | "supplier"
  | "sales"
  | "customer"
  | "agreement"
  | "contractor"
  | "unit"
  | "report"
  | "member"
  | "activity"
  | "settings";

export type NavSub = {
  key: string;
  page: string;
  // Matches only with these query values (?tab=phases); `fallback` also matches a bare page.
  query?: Record<string, string>;
  fallback?: boolean;
  // Pages under this one (a supplier's ledger, a new expense) that keep this item lit.
  nested?: boolean;
};
export type NavLink = { key: NavNodeKey; icon: IconName; page: string; label?: string };
export type NavGroup = { key: NavNodeKey; icon: IconName; label?: string; children: NavSub[] };
export type NavNode = NavLink | NavGroup;
export type ProjectNav = { main: NavNode[]; more: NavNode[] };

export const isGroup = (node: NavNode): node is NavGroup => "children" in node;

type Project = Pick<IProjectSummary, "kind" | "ownership">;

// Every sub-page the design has, in its order. A page that is not built yet stays out of the
// menu (BUILT below) so no item ever leads to a 404; it joins as its page lands.
const GROUPS: Record<Exclude<NavNodeKey, "overview">, { icon: IconName; children: NavSub[] }> = {
  balance: {
    icon: "landmark",
    children: [
      { key: "accounts", page: "accounts", nested: true },
      { key: "transfer", page: "accounts", query: { transfer: "1" } },
    ],
  },
  expense: {
    icon: "receipt",
    children: [{ key: "list", page: "expenses", nested: true }],
  },
  shareholder: { icon: "users", children: [{ key: "list", page: "partners", nested: true }] },
  loan: { icon: "handCoins", children: [] },
  supplier: { icon: "store", children: [{ key: "list", page: "suppliers", nested: true }] },
  sales: { icon: "key", children: [{ key: "list", page: "sales", nested: true }] },
  customer: { icon: "user", children: [{ key: "list", page: "customers", nested: true }] },
  agreement: { icon: "fileCheck", children: [] },
  contractor: {
    icon: "hardHat",
    children: [
      { key: "list", page: "contractors", nested: true },
      { key: "attendance", page: "contractors/attendance" },
    ],
  },
  unit: {
    icon: "building",
    children: [
      { key: "map", page: "units", nested: true },
      { key: "add", page: "units", query: { add: "1" } },
    ],
  },
  report: {
    icon: "barChart",
    children: [
      { key: "overview", page: "reports", query: { r: "EXPENSE" }, fallback: true },
      { key: "profit", page: "reports", query: { r: "PROFIT" } },
      { key: "collection", page: "reports", query: { r: "COLLECTION" } },
      { key: "dues", page: "reports", query: { r: "DUES" } },
    ],
  },
  member: {
    icon: "userPlus",
    children: [
      { key: "list", page: "members" },
      { key: "invite", page: "members", query: { invite: "1" } },
    ],
  },
  activity: { icon: "history", children: [{ key: "log", page: "activity", nested: true }] },
  settings: {
    icon: "sliders",
    children: [
      { key: "project", page: "settings", query: { tab: "general" }, fallback: true },
      { key: "phases", page: "settings", query: { tab: "phases" } },
      { key: "lists", page: "settings", query: { tab: "categories" } },
      { key: "receipt", page: "settings", query: { tab: "receipt" } },
      { key: "support", page: "settings", query: { tab: "danger" } },
    ],
  },
};

const group = (key: Exclude<NavNodeKey, "overview">, label?: string): NavGroup => ({ key, label, ...GROUPS[key] });

export const projectNav = (project: Project): ProjectNav => {
  const menus = menusFor(project);
  const has = (menu: Parameters<typeof menus.includes>[0]) => menus.includes(menu);
  const overview: NavLink = { key: "overview", icon: "dashboard", page: "" };
  const reduced = project.kind === "FARM" || project.kind === "BUSINESS";
  const land = project.kind === "LAND";

  const main: NavNode[] = [overview, group("balance")];
  if (!reduced) main.push(group("expense"));
  if (has("partners")) main.push(group("shareholder"));
  main.push(group("loan"), group("supplier"));
  if (has("farmSales")) main.push({ key: "sales", icon: "egg", page: "farm-sales" });
  else if (has("bizSales")) main.push({ key: "sales", icon: "shop", page: "biz-sales" });
  else if (has("sales")) main.push(group("sales"), group("customer", land ? "buyers" : undefined), group("agreement"));

  const more: NavNode[] = [];
  if (reduced) more.push({ key: "expense", icon: "receipt", page: "expenses" });
  more.push(group("contractor"));
  if (has("units") || has("plots")) more.push(group("unit", land ? "plots" : undefined));
  more.push(group("report"), group("member"), group("activity"), group("settings"));

  // A group whose pages are all still to come stays out of the menu.
  const shown = (node: NavNode) => !isGroup(node) || node.children.length > 0;
  return { main: main.filter(shown), more: more.filter(shown) };
};

// Which node and sub-item the address belongs to: an exact page with its tab first, then the
// deepest page that owns nested pages.
export const activeIn = (nav: ProjectNav, path: string, search: URLSearchParams): { node: NavNodeKey; sub?: string } | null => {
  const nodes = [...nav.main, ...nav.more];
  let best: { node: NavNodeKey; sub?: string; score: number } | null = null;
  const consider = (node: NavNodeKey, sub: string | undefined, score: number) => {
    if (score > 0 && (!best || score > best.score)) best = { node, sub, score };
  };
  for (const node of nodes) {
    if (!isGroup(node)) {
      if (path === node.page || (node.page && path.startsWith(`${node.page}/`))) consider(node.key, undefined, node.page.length * 4 + 2);
      continue;
    }
    for (const sub of node.children) {
      const exact = path === sub.page;
      const under = sub.nested && path.startsWith(`${sub.page}/`);
      if (!exact && !under) continue;
      const pinned = Object.entries(sub.query ?? {});
      const queryHit = pinned.length > 0 && pinned.every(([name, value]) => search.get(name) === value);
      const bare = pinned.every(([name]) => !search.get(name));
      // Exact page + its tab beats a bare page, which beats a page that owns nested pages.
      if (exact && queryHit) consider(node.key, sub.key, sub.page.length * 4 + 3);
      else if (exact && (pinned.length === 0 || (sub.fallback && bare))) consider(node.key, sub.key, sub.page.length * 4 + 1);
      else if (under) consider(node.key, sub.key, sub.page.length * 4);
    }
  }
  return best ? { node: (best as { node: NavNodeKey }).node, sub: (best as { sub?: string }).sub } : null;
};

export const subHref = (sub: NavSub) => (sub.query ? `${sub.page}?${new URLSearchParams(sub.query).toString()}` : sub.page);

// The page a project sells from, for the overview's "sale" shortcut and the phone bar.
export const salesPageOf = (project: Project): string | null => {
  const menus = menusFor(project);
  if (menus.includes("farmSales")) return "farm-sales";
  if (menus.includes("bizSales")) return "biz-sales";
  return menus.includes("sales") ? "sales" : null;
};
