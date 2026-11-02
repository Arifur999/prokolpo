"use server";

import { getMessages, getTranslations } from "next-intl/server";
import { runAction, toValidationError } from "@/lib/runAction";
import { getResetOptions, sendResetLink } from "@/services/auth.services";
import type { ApiResult } from "@/types/api.types";
import type { IResetOptions } from "@/types/auth.types";
import { forgotPhoneSchema } from "@/zod/auth.validation";

const failedMessage = async () => (await getTranslations("Auth.forgot"))("failed");

// Step one: which ways can this number reset? The phone is normalised before it leaves.
export const resetOptionsAction = async (phone: string): Promise<ApiResult<IResetOptions & { phone: string }>> => {
  const parsed = forgotPhoneSchema((await getMessages()).Auth.validation).safeParse({ phone });
  if (!parsed.success) return toValidationError(parsed.error);
  return runAction(await failedMessage(), async () => ({
    success: true,
    message: "",
    data: { ...(await getResetOptions(parsed.data.phone)), phone: parsed.data.phone },
  }));
};

export const sendResetLinkAction = async (phone: string): Promise<ApiResult<null>> =>
  runAction(await failedMessage(), async () => ({ success: true, message: "", data: await sendResetLink(phone) }));
