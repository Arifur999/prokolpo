import { isAxiosError } from "axios";
import type { ApiErrorResponse, IApiFieldError } from "@/types/api.types";

// Whatever a service threw -> the one message an action returns.
// Precedence: the API's message, then "never reached the API", then a plain Error's message,
// then the caller's fallback.
export const getActionErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    if (!error.response) return "Unable to reach the server. Please try again.";
    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

// The API's errorSource ([{ path, message }]) keyed by path, the shape forms read.
const getFieldErrors = (error: unknown): Record<string, string> | undefined => {
  if (!isAxiosError(error)) return undefined;
  const source = (error.response?.data as { errorSource?: unknown } | undefined)?.errorSource;
  if (!Array.isArray(source) || source.length === 0) return undefined;
  return Object.fromEntries((source as IApiFieldError[]).map((field) => [field.path, field.message]));
};

export const toActionError = (error: unknown, fallback: string): ApiErrorResponse => {
  const fieldErrors = getFieldErrors(error);
  const message = getActionErrorMessage(error, fallback);
  return fieldErrors ? { success: false, message, fieldErrors } : { success: false, message };
};
