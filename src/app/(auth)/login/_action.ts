"use server";

import { redirect } from "next/navigation";
import { toActionError } from "@/lib/actionError";
import { safeRedirect } from "@/lib/authUtils";
import { setAuthCookies } from "@/lib/tokenUtils";
import { login } from "@/services/auth.services";
import type { ApiErrorResponse } from "@/types/api.types";
import { loginServerZodSchema } from "@/zod/auth.validation";

// Resolves only on failure. Success sets the cookies and redirects to ?redirect= when
// safeRedirect allows it for this role.
export const loginAction = async (values: unknown, redirectTo?: string): Promise<ApiErrorResponse> => {
  const parsed = loginServerZodSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid email or password" };

  let destination: string;
  try {
    const { accessToken, refreshToken, user } = await login(parsed.data);
    await setAuthCookies(accessToken, refreshToken);
    destination = safeRedirect(redirectTo, user.role);
  } catch (error) {
    return toActionError(error, "Invalid email or password");
  }

  // Outside the try/catch: redirect() throws NEXT_REDIRECT, which the catch would swallow.
  redirect(destination);
};
