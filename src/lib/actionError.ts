import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api.types";

// Whatever a service threw -> the one message an action returns.
// Precedence: the API's message (NestJS sends string or string[]), then "never reached
// the API", then a plain Error's message, then the caller's fallback.
export const getActionErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    if (!error.response) return "Unable to reach the server. Please try again.";
    const message = (error.response.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message) && message.length > 0) return message.join(", ");
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const toActionError = (error: unknown, fallback: string): ApiErrorResponse => ({
  success: false,
  message: getActionErrorMessage(error, fallback),
});
