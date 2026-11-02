"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { LOGIN_ROUTE } from "@/lib/authUtils";
import { runAction } from "@/lib/runAction";
import { clearAuthCookies, setAuthCookies } from "@/lib/tokenUtils";
import { changePhone, deleteAccount, endDevice, endOtherDevices, saveLocale, updateProfile } from "@/services/account.services";
import { changePassword } from "@/services/auth.services";
import type { IProfilePayload } from "@/types/account.types";
import type { ApiResult } from "@/types/api.types";
import type { IUser } from "@/types/auth.types";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const failed = async () => (await getTranslations("Profile"))("failed");

export const saveProfileAction = async (payload: IProfilePayload): Promise<ApiResult<IUser>> => runAction(await failed(), () => updateProfile(payload));

// The API hands this device a fresh session (the old token predates the new password).
export const changePasswordAction = async (currentPassword: string, password: string, logoutOthers: boolean): Promise<ApiResult<null>> =>
  runAction(await failed(), async () => {
    const session = await changePassword(currentPassword, password, logoutOthers);
    await setAuthCookies(session);
    return { success: true, message: "", data: null };
  });

export const changePhoneAction = async (phone: string, password: string): Promise<ApiResult<IUser>> =>
  runAction(await failed(), () => changePhone(phone, password));

export const endDeviceAction = async (id: string): Promise<ApiResult<null>> => runAction(await failed(), () => endDevice(id));

export const endOtherDevicesAction = async (): Promise<ApiResult<{ ended: number }>> => runAction(await failed(), () => endOtherDevices());

// Saves the language on the account and in the cookie the app reads it from.
export const setLanguageAction = async (locale: string): Promise<ApiResult<null>> => {
  if (!isLocale(locale)) return { success: false, message: await failed() };
  const result = await runAction(await failed(), () => saveLocale(locale));
  if (result.success) (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR_SECONDS, sameSite: "lax" });
  return result;
};

// On success the account is gone: clear this browser's session and go to the login page.
export const deleteAccountAction = async (password: string): Promise<ApiResult<null>> => {
  const result = await runAction(await failed(), () => deleteAccount(password));
  if (!result.success) return result;
  await clearAuthCookies();
  redirect(LOGIN_ROUTE);
};
