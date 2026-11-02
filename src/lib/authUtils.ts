import type { UserRole } from "@/types/auth.types";

export const LOGIN_ROUTE = "/login";

// The dashboard layout redirects here when the API rejects a token proxy.ts still accepted;
// proxy then clears the stale cookies instead of bouncing back to the dashboard (a loop).
export const SESSION_EXPIRED_REASON = "session-expired";
export const SESSION_EXPIRED_LOGIN_ROUTE = `${LOGIN_ROUTE}?reason=${SESSION_EXPIRED_REASON}`;

// Staff land in the app too; the admin panel opens from their user menu.
export const DEFAULT_DASHBOARD: Record<UserRole, string> = {
  user: "/dashboard",
  staff: "/dashboard",
};

type RouteRule = { pattern: RegExp; roles: UserRole[] };

// The route ownership table: the only thing proxy.ts consults. First match wins,
// so list specific paths before their parents.
export const ROUTE_RULES: RouteRule[] = [
  { pattern: /^\/admin(\/|$)/, roles: ["staff"] },
  { pattern: /^\/(dashboard|projects|receipts|billing|profile)(\/|$)/, roles: ["user", "staff"] },
];

export const isProtected = (pathname: string) => ROUTE_RULES.some((rule) => rule.pattern.test(pathname));

export const canAccessRoute = (pathname: string, role: UserRole) => ROUTE_RULES.find((rule) => rule.pattern.test(pathname))?.roles.includes(role) ?? true;

// Guards ?redirect=: same-origin paths only (no "//evil.com", no "https://..."),
// and only into areas this role can open. Browsers drop tabs and newlines from a URL, so
// "/\t/evil.com" would turn into "//evil.com": control characters and backslashes are refused.
const UNSAFE_PATH = /[\u0000-\u001f\u007f\\]/;

export const safeRedirect = (target: string | null | undefined, role: UserRole): string => {
  if (!target || !target.startsWith("/") || target.startsWith("//") || UNSAFE_PATH.test(target)) return DEFAULT_DASHBOARD[role];
  const pathname = target.split(/[?#]/)[0] ?? "";
  if (pathname === LOGIN_ROUTE || !canAccessRoute(pathname, role)) return DEFAULT_DASHBOARD[role];
  return target;
};
