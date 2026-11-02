import "server-only";
import axios from "axios";
import { getEnv } from "@/env";
import type { IApiSuccessBody } from "@/types/api.types";

export interface IPlatformStatus {
  maintenance: { enabled: boolean; until: string | null };
}

const CACHE_MS = 10_000;
let cached: { at: number; status: IPlatformStatus } | null = null;

// proxy.ts asks on every navigation, so the answer is kept for 10 seconds (the API caches as
// long). If the API cannot be reached, null: the app's own error handling shows that.
export const getPlatformStatus = async ({ fresh = false } = {}): Promise<IPlatformStatus | null> => {
  if (!fresh && cached && Date.now() - cached.at < CACHE_MS) return cached.status;
  try {
    const response = await axios.get<IApiSuccessBody<IPlatformStatus>>(`${getEnv().API_BASE_URL}/status`, { timeout: 5_000 });
    cached = { at: Date.now(), status: response.data.data };
    return cached.status;
  } catch {
    return null;
  }
};
