import type { z } from "@/lib/zod";
import type { ApiErrorResponse, ApiResponse, ApiResult } from "@/types/api.types";
import { toActionError } from "./actionError";

// What every _action.ts does, written once: re-validate on the server, call the service,
// turn any throw into { success: false, message }. Actions never throw.

export const toValidationError = (error: z.ZodError): ApiErrorResponse => ({
  success: false,
  message: error.issues[0]?.message ?? "Invalid input",
  fieldErrors: Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message])),
});

export const runAction = async <T>(fallback: string, run: () => Promise<ApiResponse<T>>): Promise<ApiResult<T>> => {
  try {
    return await run();
  } catch (error) {
    return toActionError(error, fallback);
  }
};

export const runValidatedAction = async <S extends z.ZodType, T>(
  schema: S,
  values: unknown,
  fallback: string,
  run: (data: z.output<S>) => Promise<ApiResponse<T>>,
): Promise<ApiResult<T>> => {
  const parsed = schema.safeParse(values);
  return parsed.success ? runAction(fallback, () => run(parsed.data)) : toValidationError(parsed.error);
};

// An empty id would otherwise turn DELETE /products/:id into DELETE /products/.
export const requireId = (id: string | undefined, label = "record"): ApiErrorResponse | null =>
  id ? null : { success: false, message: `Invalid ${label} id` };
