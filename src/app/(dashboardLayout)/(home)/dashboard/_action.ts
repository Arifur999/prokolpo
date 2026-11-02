"use server";

import { getTranslations } from "next-intl/server";
import { requireId, runAction } from "@/lib/runAction";
import { deleteProject, restoreProject } from "@/services/project.services";
import type { ApiResult } from "@/types/api.types";

export const deleteProjectAction = async (id: string): Promise<ApiResult<null>> =>
  requireId(id, "project") ?? runAction((await getTranslations("Dashboard"))("actionFailed"), () => deleteProject(id));

export const restoreProjectAction = async (id: string): Promise<ApiResult<null>> =>
  requireId(id, "project") ?? runAction((await getTranslations("Dashboard"))("actionFailed"), () => restoreProject(id));
