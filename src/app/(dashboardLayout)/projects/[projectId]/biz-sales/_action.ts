"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { collectKhata, saveShopDay } from "@/services/shop.services";
import type { ApiResult } from "@/types/api.types";
import type { IShopDayPayload } from "@/types/shop.types";

const failed = async () => (await getTranslations("Shop"))("failed");

export const saveShopDayAction = async (projectId: string, day: IShopDayPayload): Promise<ApiResult<null>> =>
  runAction(await failed(), () => saveShopDay(projectId, day));

export const collectKhataAction = async (projectId: string, personId: string, payment: { amount: number; accountId: string }): Promise<ApiResult<null>> =>
  runAction(await failed(), () => collectKhata(projectId, personId, payment));
