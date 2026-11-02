"use server";

import { getMessages, getTranslations } from "next-intl/server";
import { runAction, toValidationError } from "@/lib/runAction";
import { createSupportRequest } from "@/services/support.services";
import type { ApiResult } from "@/types/api.types";
import type { ISupportReceipt } from "@/types/support.types";
import { supportRequestSchema } from "@/zod/support.validation";

export const supportRequestAction = async (values: unknown): Promise<ApiResult<ISupportReceipt>> => {
  const parsed = supportRequestSchema((await getMessages()).Support.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);
  return runAction((await getTranslations("Support"))("failed"), () => createSupportRequest(parsed.data));
};
