"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { collect, createSale } from "@/services/sales.services";
import type { ApiResult } from "@/types/api.types";
import type { ISalePayload, ISold } from "@/types/sales.types";

const failed = async () => (await getTranslations("Sales"))("failed");

export const collectAction = async (
  projectId: string,
  saleId: string,
  payment: { amount: number; accountId: string; note: string },
): Promise<ApiResult<ISold>> => runAction(await failed(), () => collect(projectId, saleId, payment));

export const createSaleAction = async (projectId: string, sale: ISalePayload): Promise<ApiResult<ISold>> =>
  runAction(await failed(), () => createSale(projectId, sale));
