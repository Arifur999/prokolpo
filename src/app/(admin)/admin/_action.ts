"use server";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { ADMIN_SESSION_COOKIE, cookieOptions } from "@/lib/tokenUtils";
import { enableStaffTwoFactor, endAdminSession, verifyStaffCode } from "@/services/staff.services";
import type { ApiResult } from "@/types/api.types";
import type { IStaffVerified } from "@/types/staff.types";

// The cookie outlives an idle panel; the API ends the session after 30 idle minutes.
const SESSION_COOKIE_SECONDS = 12 * 60 * 60;

const keep = async (session: string) => (await cookies()).set(ADMIN_SESSION_COOKIE, session, { ...cookieOptions(SESSION_COOKIE_SECONDS), sameSite: "strict" });

const failed = async () => (await getTranslations("AdminSecurity"))("failed");

export const verifyCodeAction = async (code: string, backup: boolean): Promise<ApiResult<Omit<IStaffVerified, "session">>> => {
  const result = await runAction(await failed(), () => verifyStaffCode(code, backup));
  if (!result.success) return result;
  await keep(result.data.session);
  return { ...result, data: { usedBackup: result.data.usedBackup, backupLeft: result.data.backupLeft } };
};

export const enableTwoFactorAction = async (code: string): Promise<ApiResult<{ codes: string[] }>> => {
  const result = await runAction(await failed(), () => enableStaffTwoFactor(code));
  if (!result.success) return result;
  await keep(result.data.session);
  return { ...result, data: { codes: result.data.codes } };
};

export const endAdminSessionAction = async (): Promise<void> => {
  await endAdminSession().catch(() => undefined);
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
};
