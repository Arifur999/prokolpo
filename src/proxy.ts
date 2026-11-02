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
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  cookieMaxAge,
  cookieOptions,
  getTokenSecondsRemaining,
  isTokenExpiringSoon,
  REFRESH_TOKEN_COOKIE,
} from "./lib/tokenUtils";
import { refreshAccessToken } from "./services/auth.services";
import type { IAccessTokenPayload } from "./types/auth.types";

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const isLogin = pathname === LOGIN_ROUTE;

  // The API rejected a token this proxy would still accept: clear it and show the login
  // page, instead of redirecting straight back to the dashboard in a loop.
  if (isLogin && searchParams.get("reason") === SESSION_EXPIRED_REASON) {
    const response = NextResponse.next();
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  let refreshed: string | null = null;

  if (refreshToken && (!accessToken || isTokenExpiringSoon(accessToken))) {
    refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) accessToken = refreshed;
  }

  const payload = accessToken ? jwtUtils.decodeToken<IAccessTokenPayload>(accessToken) : null;
  const session = payload && accessToken && getTokenSecondsRemaining(accessToken) > 0 ? payload : null;

  // Every response that lets the user through carries the refreshed token, redirects
  // included; otherwise the very next request refreshes again.
  const pass = (response: NextResponse) => {
    if (refreshed) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed, cookieOptions(cookieMaxAge(refreshed, ACCESS_TOKEN_MAX_AGE_SECONDS)));
    }
    return response;
  };

  if (session && isLogin) {
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
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
