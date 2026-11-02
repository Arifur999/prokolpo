"use server";

import { getMessages, getTranslations } from "next-intl/server";
import { runAction, toValidationError } from "@/lib/runAction";
import { resetPassword, resetWithCode } from "@/services/auth.services";
import type { ApiResult } from "@/types/api.types";
import { newPasswordSchema } from "@/zod/auth.validation";

export const resetPasswordAction = async (token: string, values: unknown): Promise<ApiResult<null>> => {
  const parsed = newPasswordSchema((await getMessages()).Auth.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);
  const failed = (await getTranslations("Auth.reset"))("failed");
  return runAction(failed, async () => ({ success: true, message: "", data: await resetPassword(token, parsed.data.password) }));
};

// The owner-code way: the code and the new password go together; a wrong code comes back
// on the code field with the tries left.
export const resetWithCodeAction = async (phone: string, code: string, values: unknown): Promise<ApiResult<null>> => {
  const parsed = newPasswordSchema((await getMessages()).Auth.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);
  const failed = (await getTranslations("Auth.reset"))("failed");
  return runAction(failed, async () => ({ success: true, message: "", data: await resetWithCode(phone, code, parsed.data.password) }));
};
