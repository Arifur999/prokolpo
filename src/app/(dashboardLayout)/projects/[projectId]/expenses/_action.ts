"use server";

import { getTranslations } from "next-intl/server";
import { requireId, runAction } from "@/lib/runAction";
import { deleteExpense, restoreExpense } from "@/services/books.services";
import type { ApiResult } from "@/types/api.types";

export const deleteExpenseAction = async (projectId: string, id: string, reason: string): Promise<ApiResult<null>> =>
  requireId(id, "expense") ?? runAction((await getTranslations("Expenses"))("failed"), () => deleteExpense(projectId, id, reason.trim()));

export const restoreExpenseAction = async (projectId: string, id: string): Promise<ApiResult<null>> =>
  requireId(id, "expense") ?? runAction((await getTranslations("Expenses"))("failed"), () => restoreExpense(projectId, id));
