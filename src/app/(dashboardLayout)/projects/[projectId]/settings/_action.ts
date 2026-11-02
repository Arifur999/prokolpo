"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { deleteProject } from "@/services/project.services";
import {
  addCategory,
  deleteCategory,
  exportProject,
  grantSupport,
  revokeSupport,
  saveGeneral,
  savePhases,
  saveReceipt,
  transferOwnership,
  updateCategory,
} from "@/services/settings.services";
import type { ApiResult } from "@/types/api.types";
import type { ICategoryPayload, IExportSheet, IGeneralPayload, IPhasePayload, IReceiptPayload, ISettingsCategory } from "@/types/settings.types";

const failed = async () => (await getTranslations("Settings"))("failed");

export const saveGeneralAction = async (projectId: string, payload: IGeneralPayload): Promise<ApiResult<null>> =>
  runAction(await failed(), () => saveGeneral(projectId, payload));

export const savePhasesAction = async (projectId: string, phases: IPhasePayload[]): Promise<ApiResult<null>> =>
  runAction(await failed(), () => savePhases(projectId, phases));

export const addCategoryAction = async (projectId: string, payload: ICategoryPayload): Promise<ApiResult<ISettingsCategory>> =>
  runAction(await failed(), () => addCategory(projectId, payload));

export const updateCategoryAction = async (projectId: string, id: string, payload: ICategoryPayload): Promise<ApiResult<null>> =>
  runAction(await failed(), () => updateCategory(projectId, id, payload));

export const deleteCategoryAction = async (projectId: string, id: string): Promise<ApiResult<null>> =>
  runAction(await failed(), () => deleteCategory(projectId, id));

export const saveReceiptAction = async (projectId: string, payload: IReceiptPayload): Promise<ApiResult<null>> =>
  runAction(await failed(), () => saveReceipt(projectId, payload));

export const grantSupportAction = async (projectId: string, hours: number): Promise<ApiResult<null>> =>
  runAction(await failed(), () => grantSupport(projectId, hours));

export const revokeSupportAction = async (projectId: string): Promise<ApiResult<null>> => runAction(await failed(), () => revokeSupport(projectId));

export const transferAction = async (projectId: string, userId: string): Promise<ApiResult<null>> =>
  runAction(await failed(), () => transferOwnership(projectId, userId));

export const exportAction = async (projectId: string): Promise<ApiResult<IExportSheet[]>> => runAction(await failed(), () => exportProject(projectId));

export const deleteProjectAction = async (projectId: string): Promise<ApiResult<null>> => runAction(await failed(), () => deleteProject(projectId));
