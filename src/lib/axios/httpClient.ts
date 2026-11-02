import "server-only";
import axios from "axios";
import { cookies } from "next/headers";
import { getEnv } from "@/env";
import { ACCESS_TOKEN_COOKIE } from "@/lib/tokenUtils";
import type { ApiResponse, IApiSuccessBody } from "@/types/api.types";
import { logServiceError } from "./logServiceError";

// One shared instance (connection reuse). Per-request auth is added by the request
// interceptor, which reads this request's cookies. Token refresh lives in proxy.ts only:
// Server Components cannot write cookies.
const instance = axios.create({
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(async (config) => {
  config.baseURL = getEnv().API_BASE_URL;
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// Log once, safely, then rethrow for _action.ts to turn into a value.
instance.interceptors.response.use(undefined, (error: unknown) => {
  logServiceError("API request failed", error);
  return Promise.reject(error);
});

export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

type Method = "get" | "post" | "put" | "patch" | "delete";

// The API answers in its envelope; unwrap it so callers get data, the API's message (toast text)
// and, for lists, meta. Non-2xx answers throw and become ApiErrorResponse in actionError.
const send = async <TData>(method: Method, url: string, body?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
  const { data: envelope } = await instance.request<IApiSuccessBody<TData>>({
    method,
    url,
    params: options?.params,
    headers: options?.headers,
    signal: options?.signal,
    data: method === "get" || method === "delete" ? undefined : (body ?? {}),
  });
  return envelope.meta
    ? { success: true, message: envelope.message, data: envelope.data, meta: envelope.meta }
    : { success: true, message: envelope.message, data: envelope.data };
};

// List endpoints: same envelope, with meta. Kept as its own name so list services read as such.
const getPaginated = <TItem>(url: string, options?: ApiRequestOptions) => send<TItem[]>("get", url, undefined, options);

export const httpClient = {
  get: <T>(url: string, options?: ApiRequestOptions) => send<T>("get", url, undefined, options),
  getPaginated,
  post: <T>(url: string, body?: unknown, options?: ApiRequestOptions) => send<T>("post", url, body, options),
  put: <T>(url: string, body?: unknown, options?: ApiRequestOptions) => send<T>("put", url, body, options),
  patch: <T>(url: string, body?: unknown, options?: ApiRequestOptions) => send<T>("patch", url, body, options),
  delete: <T>(url: string, options?: ApiRequestOptions) => send<T>("delete", url, undefined, options),
};
