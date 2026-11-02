import "server-only";
import axios, { isAxiosError } from "axios";
import { cache } from "react";
import { getEnv } from "@/env";
import { logServiceError } from "@/lib/axios/logServiceError";
import { getForwardHeaders } from "@/lib/forwardHeaders";
import { getAccessToken } from "@/lib/tokenUtils";
import type { IApiSuccessBody } from "@/types/api.types";
import type { ILoginPayload, IRegisterPayload, IResetOptions, ISession, IUser, RegistrationMode } from "@/types/auth.types";

// The one service that is NOT "use server": login, register and refresh return raw tokens,
// and every export of a "use server" file is a client-callable endpoint. They run only from
// server code (actions, proxy.ts, layouts); server-only is the guard. Raw axios, not
// httpClient: these run before a session exists or must stay independent of it.

const url = (path: string) => `${getEnv().API_BASE_URL}${path}`;

const post = async <T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> => {
  const response = await axios.post<IApiSuccessBody<T>>(url(path), body, { headers: headers ?? (await getForwardHeaders()), timeout: 15_000 });
  return response.data.data;
};

export const login = (payload: ILoginPayload) => post<ISession>("/auth/login", payload);

export const register = (payload: IRegisterPayload) => post<ISession>("/auth/register", payload);

export const getRegistrationMode = async (): Promise<RegistrationMode> => {
  const response = await axios.get<IApiSuccessBody<{ mode: RegistrationMode }>>(url("/auth/registration"), { timeout: 15_000 });
  return response.data.data.mode;
};

// null instead of throwing: proxy.ts treats "refresh failed" as signed out. proxy passes its
// own request's headers because next/headers is not available there.
export const refreshSession = async (refreshToken: string, headers: Record<string, string>): Promise<ISession | null> => {
  try {
    return await post<ISession>("/auth/refresh", { refreshToken }, headers);
  } catch {
    return null;
  }
};

export const logout = (refreshToken: string) => post<null>("/auth/logout", { refreshToken });

export const getResetOptions = (phone: string) => post<IResetOptions>("/auth/password/options", { phone });

export const sendResetLink = (phone: string) => post<null>("/auth/password/email", { phone });

export const checkResetLink = (token: string) => post<{ valid: boolean }>("/auth/password/check", { token });

export const resetPassword = (token: string, password: string) => post<null>("/auth/password/reset", { token, password });

// Layout, sidebar and page all need the user in one request; cache() makes that one round trip.
// Returns null ONLY when the API says the token is no good (401/403). Anything else (API down,
// 5xx, timeout) throws to error.tsx: an outage must not log everyone out.
export const getUserInfo = cache(async (): Promise<IUser | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await axios.get<IApiSuccessBody<IUser>>(url("/auth/me"), {
      headers: { ...(await getForwardHeaders()), Authorization: `Bearer ${accessToken}` },
      timeout: 15_000,
    });
    return response.data.data;
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) return null;
    logServiceError("Loading the current user failed", error);
    throw error;
  }
});
