// Next 16 renamed middleware.ts to proxy.ts. Runs before every matched request (page renders
// and Server Action POSTs alike) and only consults the table in lib/authUtils.ts:
//   0. refresh an access token that is missing or about to expire
//   1. signed in + on the login page -> their dashboard
//   2. no session + protected route  -> login, remembering ?redirect=
//   3. wrong role                    -> their default dashboard, never a 403 page
// Refresh lives here because only proxy can set a cookie that the rest of the request sees.
// Tokens are decoded, not verified: this is a UX gate. The API verifies every request.

import { NextResponse, type NextRequest } from "next/server";
import { canAccessRoute, DEFAULT_DASHBOARD, isProtected, LOGIN_ROUTE, SESSION_EXPIRED_REASON } from "./lib/authUtils";
import { jwtUtils } from "./lib/jwtUtils";
import { LOCALE_COOKIE } from "./i18n/config";
import { forwardHeadersFrom } from "./lib/forwardHeaders";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  cookieMaxAge,
  cookieOptions,
  getTokenSecondsRemaining,
  isTokenExpiringSoon,
  REFRESH_TOKEN_COOKIE,
  secondsUntil,
} from "./lib/tokenUtils";
import { refreshSession } from "./services/auth.services";
import { getPlatformStatus } from "./services/status.services";
import { ROUTES } from "./lib/routes";
import type { IAccessTokenPayload, ISession } from "./types/auth.types";

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const isAuthPage = pathname === LOGIN_ROUTE || pathname === "/register";

  // The API rejected a token this proxy would still accept: clear it and show the login
  // page, instead of redirecting straight back to the dashboard in a loop.
  if (isAuthPage && searchParams.get("reason") === SESSION_EXPIRED_REASON) {
    const response = NextResponse.next();
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  let refreshed: ISession | null = null;

  if (refreshToken && (!accessToken || isTokenExpiringSoon(accessToken))) {
    // The API rotates refresh tokens, so a successful refresh replaces both cookies.
    refreshed = await refreshSession(refreshToken, forwardHeadersFrom(request.headers, request.cookies.get(LOCALE_COOKIE)?.value));
    if (refreshed) accessToken = refreshed.accessToken;
  }

  const payload = accessToken ? jwtUtils.decodeToken<IAccessTokenPayload>(accessToken) : null;
  const session = payload && accessToken && getTokenSecondsRemaining(accessToken) > 0 ? payload : null;

  // Every response that lets the user through carries the refreshed token, redirects
  // included; otherwise the very next request refreshes again.
  const pass = (response: NextResponse) => {
    if (refreshed) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, cookieOptions(cookieMaxAge(refreshed.accessToken, ACCESS_TOKEN_MAX_AGE_SECONDS)));
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, cookieOptions(secondsUntil(refreshed.refreshTokenExpiresAt)));
    }
    return response;
  };

  // Maintenance: everyone but staff waits on /maintenance. Login stays open so staff can sign
  // in, and /maintenance itself sends people home once it is over.
  if (pathname !== ROUTES.maintenance && pathname !== LOGIN_ROUTE && session?.role !== "staff") {
    const status = await getPlatformStatus();
    if (status?.maintenance.enabled) return pass(NextResponse.redirect(new URL(ROUTES.maintenance, request.url)));
  }

  if (session && isAuthPage) {
    return pass(NextResponse.redirect(new URL(DEFAULT_DASHBOARD[session.role], request.url)));
  }

  if (!session && isProtected(pathname)) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (session && !canAccessRoute(pathname, session.role)) {
    return pass(NextResponse.redirect(new URL(DEFAULT_DASHBOARD[session.role], request.url)));
  }

  return pass(NextResponse.next());
}

export const config = {
  // Keep every protected area (and any route.ts that streams files) under these prefixes.
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/projects/:path*",
    "/billing/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/support",
    "/forgot-password",
    "/reset-password",
  ],
};
