"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { collectFromBuyer, createProduceSale, updateBatch } from "@/services/produce.services";
import type { ApiResult } from "@/types/api.types";
import type { IBatchPayload, IProduceSalePayload } from "@/types/produce.types";

const failed = async () => (await getTranslations("Produce"))("failed");

export const createProduceSaleAction = async (projectId: string, sale: IProduceSalePayload): Promise<ApiResult<{ id: string; amount: number; left: number }>> =>
  runAction(await failed(), () => createProduceSale(projectId, sale));

export const collectFromBuyerAction = async (projectId: string, buyerId: string, payment: { amount: number; accountId: string }): Promise<ApiResult<null>> =>
  runAction(await failed(), () => collectFromBuyer(projectId, buyerId, payment));

export const updateBatchAction = async (projectId: string, phaseId: string, batch: IBatchPayload): Promise<ApiResult<null>> =>
  runAction(await failed(), () => updateBatch(projectId, phaseId, batch));
