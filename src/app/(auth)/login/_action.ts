"use server";

import { redirect } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { toActionError } from "@/lib/actionError";
import { safeRedirect } from "@/lib/authUtils";
import { setAuthCookies } from "@/lib/tokenUtils";
import { login } from "@/services/auth.services";
import type { ApiErrorResponse } from "@/types/api.types";
import { loginFormSchema } from "@/zod/auth.validation";

// Resolves only on failure. Success sets the cookies and redirects to ?redirect= when
// safeRedirect allows it for this role.
export const loginAction = async (values: unknown, redirectTo?: string): Promise<ApiErrorResponse> => {
  const t = await getTranslations("Auth");
  const parsed = loginFormSchema((await getMessages()).Auth.validation).safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? t("login.failed") };

  let destination: string;
  try {
    const session = await login(parsed.data);
    await setAuthCookies(session);
    destination = safeRedirect(redirectTo, session.user.role);
  } catch (error) {
    return toActionError(error, t("login.failed"));
  }

  // Outside the try/catch: redirect() throws NEXT_REDIRECT, which the catch would swallow.
  redirect(destination);
};
