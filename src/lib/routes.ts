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
} as const;

// Shown wherever the design offers WhatsApp support (suspended login, reset email).
export const SUPPORT_WHATSAPP = "01700-000111";
