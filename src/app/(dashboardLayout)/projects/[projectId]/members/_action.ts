"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { cancelInvite, changeRole, inviteMember, issueResetCode, lookupPhone, removeMember } from "@/services/members.services";
import type { ApiResult } from "@/types/api.types";
import type { IAdded, ILookup, IResetCode, TeamRole } from "@/types/members.types";

const failed = async () => (await getTranslations("Members"))("failed");

export const lookupAction = async (projectId: string, phone: string): Promise<ApiResult<ILookup>> =>
  runAction(await failed(), () => lookupPhone(projectId, phone));

export const inviteAction = async (projectId: string, phone: string, role: TeamRole): Promise<ApiResult<IAdded>> =>
  runAction(await failed(), () => inviteMember(projectId, phone, role));

export const changeRoleAction = async (projectId: string, userId: string, role: TeamRole): Promise<ApiResult<null>> =>
  runAction(await failed(), () => changeRole(projectId, userId, role));

export const removeMemberAction = async (projectId: string, userId: string): Promise<ApiResult<null>> =>
  runAction(await failed(), () => removeMember(projectId, userId));

export const resetCodeAction = async (projectId: string, userId: string): Promise<ApiResult<IResetCode>> =>
  runAction(await failed(), () => issueResetCode(projectId, userId));

export const cancelInviteAction = async (projectId: string, inviteId: string): Promise<ApiResult<null>> =>
  runAction(await failed(), () => cancelInvite(projectId, inviteId));
