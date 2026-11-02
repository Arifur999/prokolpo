"use server";

import { redirect } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { toActionError } from "@/lib/actionError";
import { ROUTES } from "@/lib/routes";
import { runAction, toValidationError } from "@/lib/runAction";
import { setAuthCookies } from "@/lib/tokenUtils";
import { checkInvite, register } from "@/services/auth.services";
import type { ApiErrorResponse, ApiResult } from "@/types/api.types";
import type { IInviteCheck } from "@/types/auth.types";
import { registerFormSchema } from "@/zod/auth.validation";

// Resolves only on failure; a new account is signed in and sent to the dashboard.
export const registerAction = async (values: unknown): Promise<ApiErrorResponse> => {
  const parsed = registerFormSchema((await getMessages()).Auth.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);

  try {
    await setAuthCookies(await register(parsed.data));
  } catch (error) {
    return toActionError(error, (await getTranslations("Auth.register"))("failed"));
  }

  // Outside the try/catch: redirect() throws NEXT_REDIRECT, which the catch would swallow.
  redirect(`${ROUTES.dashboard}?welcome`);
};

// While registration is closed, an invited number may still register: find its invitation.
export const checkInviteAction = async (phone: string): Promise<ApiResult<IInviteCheck>> =>
  runAction((await getTranslations("Auth.register"))("failed"), async () => ({ success: true, message: "", data: await checkInvite(phone) }));
