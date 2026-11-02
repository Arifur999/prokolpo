import "server-only";
import { cookies } from "next/headers";
import { jwtUtils } from "./jwtUtils";

// Cookie names are a contract with proxy.ts. Keep every cookie/token touchpoint in this file.
export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

// Fallbacks for a token with no readable `exp`. Must match the backend's expiry settings.
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// proxy.ts refreshes an access token once it has less than this left.
export const REFRESH_THRESHOLD_SECONDS = 60;

export const getTokenSecondsRemaining = (token: string): number => {
  const exp = jwtUtils.decodeToken(token)?.exp;
  return typeof exp === "number" ? exp - Math.floor(Date.now() / 1000) : 0;
};

export const isTokenExpiringSoon = (token: string, threshold = REFRESH_THRESHOLD_SECONDS) =>
  getTokenSecondsRemaining(token) < threshold;

// The cookie expires with the token it holds, not before or after it.
export const cookieMaxAge = (token: string, fallback: number) => {
  const remaining = getTokenSecondsRemaining(token);
  return remaining > 0 ? remaining : fallback;
};

// httpOnly: the browser never needs to read these. `lax`, not `strict`, so a link opened
// from an email still carries the session.
export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  const store = await cookies();
  store.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(cookieMaxAge(accessToken, ACCESS_TOKEN_MAX_AGE_SECONDS)));
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(cookieMaxAge(refreshToken, REFRESH_TOKEN_MAX_AGE_SECONDS)));
};

export const clearAuthCookies = async () => {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
};

export const getAccessToken = async () => (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
export const getRefreshToken = async () => (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
