"use server";

import { redirect } from "next/navigation";
import { LOGIN_ROUTE } from "@/lib/authUtils";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, clearAuthCookies, getRefreshToken } from "@/lib/tokenUtils";
import { logout } from "@/services/auth.services";
import { endAdminSession } from "@/services/staff.services";

// Cross-route actions live in app/_actions (underscore = private folder, not a route).
export async function logoutAction(): Promise<void> {
  // A staff panel session ends with the sign-in, not 30 idle minutes later.
  if ((await cookies()).has(ADMIN_SESSION_COOKIE)) await endAdminSession().catch(() => undefined);
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    // Best-effort revoke: the local session is cleared either way.
    await logout(refreshToken).catch(() => undefined);
  }
  await clearAuthCookies();
  redirect(LOGIN_ROUTE);
}
