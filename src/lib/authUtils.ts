import type { UserRole } from "@/types/auth.types";

export const LOGIN_ROUTE = "/login";

// The dashboard layout redirects here when the API rejects a token proxy.ts still accepted;
// proxy then clears the stale cookies instead of bouncing back to the dashboard (a loop).
export const SESSION_EXPIRED_REASON = "session-expired";
export const SESSION_EXPIRED_LOGIN_ROUTE = `${LOGIN_ROUTE}?reason=${SESSION_EXPIRED_REASON}`;

export const DEFAULT_DASHBOARD: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  MANAGER: "/dashboard",
  STAFF: "/dashboard",
};

type RouteRule = { pattern: RegExp; roles: UserRole[] };

// The route ownership table: the only thing proxy.ts consults. First match wins,
// so list specific paths before their parents.
export const ROUTE_RULES: RouteRule[] = [
  { pattern: /^\/admin(\/|$)/, roles: ["ADMIN"] },
  { pattern: /^\/dashboard\/settings(\/|$)/, roles: ["ADMIN", "MANAGER"] },
  { pattern: /^\/dashboard(\/|$)/, roles: ["ADMIN", "MANAGER", "STAFF"] },
];

export const isProtected = (pathname: string) => ROUTE_RULES.some((rule) => rule.pattern.test(pathname));

export const canAccessRoute = (pathname: string, role: UserRole) => ROUTE_RULES.find((rule) => rule.pattern.test(pathname))?.roles.includes(role) ?? true;

// Guards ?redirect=: same-origin paths only (no "//evil.com", no "https://..."),
// and only into areas this role can open.
export const safeRedirect = (target: string | null | undefined, role: UserRole): string => {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return DEFAULT_DASHBOARD[role];
  const pathname = target.split(/[?#]/)[0] ?? "";
  if (pathname === LOGIN_ROUTE || !canAccessRoute(pathname, role)) return DEFAULT_DASHBOARD[role];
  return target;
};

// Which roles may mutate each area. Pages hide controls that would only 403; the API
// enforces the same rule, this is UX.
export const MANAGE_ROLES = {
  inventory: ["ADMIN", "MANAGER"],
  settings: ["ADMIN"],
} satisfies Record<string, UserRole[]>;

export type ManageArea = keyof typeof MANAGE_ROLES;

export const canManage = (role: UserRole | null | undefined, area: ManageArea) => Boolean(role && (MANAGE_ROLES[area] as UserRole[]).includes(role));
