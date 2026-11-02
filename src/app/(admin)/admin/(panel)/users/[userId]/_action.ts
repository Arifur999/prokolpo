"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { addUserNote, changeUserPhone, issueUserResetCode, logoutUserEverywhere, sendUserResetLink, setUserSuspended } from "@/services/admin.services";
import type { ApiResult } from "@/types/api.types";

const failed = async () => (await getTranslations("AdminUser"))("failed");

export const sendResetLinkAction = async (id: string): Promise<ApiResult<null>> => runAction(await failed(), () => sendUserResetLink(id));
export const issueResetCodeAction = async (id: string, note: string): Promise<ApiResult<{ code: string; expiresAt: string }>> =>
  runAction(await failed(), () => issueUserResetCode(id, note));
export const logoutEverywhereAction = async (id: string): Promise<ApiResult<null>> => runAction(await failed(), () => logoutUserEverywhere(id));
export const changePhoneAction = async (id: string, body: { phone: string; reason: string; code: string }): Promise<ApiResult<null>> =>
  runAction(await failed(), () => changeUserPhone(id, body));
export const setSuspendedAction = async (id: string, suspend: boolean, body: { reason: string; code: string }): Promise<ApiResult<null>> =>
  runAction(await failed(), () => setUserSuspended(id, suspend, body));
export const addNoteAction = async (id: string, body: string): Promise<ApiResult<null>> => runAction(await failed(), () => addUserNote(id, body));
