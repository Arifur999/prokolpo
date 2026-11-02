import "server-only";
import axios, { isAxiosError } from "axios";
import { cache } from "react";
import { getEnv } from "@/env";
import { logServiceError } from "@/lib/axios/logServiceError";
import { getAccessToken } from "@/lib/tokenUtils";
import type { ILoginPayload, ILoginResponse, IUser } from "@/types/auth.types";

// The one service that is NOT "use server": login() and refreshAccessToken() return raw
// tokens, and every export of a "use server" file is a client-callable endpoint.
// They run only from server code (login action, proxy.ts, layouts); server-only is the guard.
// Raw axios, not httpClient: these run before a session exists or must stay independent of it.

const url = (path: string) => `${getEnv().API_BASE_URL}${path}`;

export const login = async (payload: ILoginPayload): Promise<ILoginResponse> => {
  try {
    return (await axios.post<ILoginResponse>(url("/auth/login"), payload)).data;
  } catch (error) {
    logServiceError("Login failed", error);
    throw error;
  }
};

// null instead of throwing: proxy.ts treats "refresh failed" as signed out.
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    return (await axios.post<{ accessToken: string }>(url("/auth/refresh"), { refreshToken })).data.accessToken;
  } catch {
    return null;
  }
};

export const logout = async (refreshToken: string): Promise<void> => {
  await axios.post(url("/auth/logout"), { refreshToken });
};

// Layout, sidebar and page all need the user in one request; cache() makes that one round trip.
// Returns null ONLY when the API says the token is no good (401/403). Anything else (API down,
// 5xx, timeout) throws to error.tsx: an outage must not log everyone out (travelar did, and
// the login page was broken by the same outage).
export const getUserInfo = cache(async (): Promise<IUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await axios.get<IUser>(url("/auth/me"), { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) return null;
    logServiceError("Loading the current user failed", error);
    throw error;
  }
});
