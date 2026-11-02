"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { addPartner, createCall, depositFor, lookupPartner } from "@/services/partners.services";
import type { ApiResult } from "@/types/api.types";
import type { ICapitalCall, IDepositPayload, INewPartnerPayload, IPartner, IPartnerLookup } from "@/types/partners.types";

const failed = async () => (await getTranslations("Partners"))("failed");

export const lookupPartnerAction = async (projectId: string, phone: string): Promise<ApiResult<IPartnerLookup>> =>
  runAction(await failed(), () => lookupPartner(projectId, phone));

export const addPartnerAction = async (projectId: string, payload: INewPartnerPayload): Promise<ApiResult<IPartner>> =>
  runAction(await failed(), () => addPartner(projectId, payload));

export const depositAction = async (projectId: string, partnerId: string, payload: IDepositPayload): Promise<ApiResult<{ id: string; receiptNo: string }>> =>
  runAction(await failed(), () => depositFor(projectId, partnerId, payload));

export const createCallAction = async (projectId: string, total: number, reason: string): Promise<ApiResult<ICapitalCall>> =>
  runAction(await failed(), () => createCall(projectId, total, reason));
