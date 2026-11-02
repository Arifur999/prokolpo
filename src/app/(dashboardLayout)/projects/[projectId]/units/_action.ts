"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { addUnits, deleteUnit, updateUnit } from "@/services/sales.services";
import type { ApiResult } from "@/types/api.types";
import type { IUnitPayload } from "@/types/sales.types";

const failed = async () => (await getTranslations("Units"))("failed");

export const addUnitsAction = async (projectId: string, units: IUnitPayload[]): Promise<ApiResult<{ added: number }>> =>
  runAction(await failed(), () => addUnits(projectId, units));

export const updateUnitAction = async (projectId: string, unitId: string, unit: IUnitPayload): Promise<ApiResult<null>> =>
  runAction(await failed(), () => updateUnit(projectId, unitId, unit));

export const deleteUnitAction = async (projectId: string, unitId: string): Promise<ApiResult<null>> =>
  runAction(await failed(), () => deleteUnit(projectId, unitId));
