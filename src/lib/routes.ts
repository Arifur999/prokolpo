// Public paths, matching the design's page names. App routes join this as they are built.
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  support: "/support",
  terms: "/terms",
  privacy: "/privacy",
  maintenance: "/maintenance",
  newProject: "/projects/new",
  profile: "/profile",
  admin: "/admin",
} as const;

// A project's pages hang off its id: /projects/{id}, /projects/{id}/expenses, ...
export const projectHref = (id: string, page = "") => `/projects/${id}${page ? `/${page}` : ""}`;

// Support page pre-filled for where the person came from (see app/(auth)/support/page.tsx).
export const supportHref = (from: "forgot" | "suspended", phone?: string | null) =>
  `${ROUTES.support}?${new URLSearchParams({ from, ...(phone ? { phone } : {}) }).toString()}`;

// Shown wherever the design offers WhatsApp support (suspended login, reset email).
export const SUPPORT_WHATSAPP = "01700-000111";
