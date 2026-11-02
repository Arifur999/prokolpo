"use server";

import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/authUtils";
import { clearAuthCookies, getRefreshToken } from "@/lib/tokenUtils";
import { logout } from "@/services/auth.services";

// Cross-route actions live in app/_actions (underscore = private folder, not a route).
export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    // Best-effort revoke: the local session is cleared either way.
    await logout(refreshToken).catch(() => undefined);
  }
  await clearAuthCookies();
  redirect(LOGIN_ROUTE);
}
