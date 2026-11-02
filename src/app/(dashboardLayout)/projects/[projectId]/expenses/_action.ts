"use server";

import { getMessages, getTranslations } from "next-intl/server";
import { requireId, runAction, toValidationError } from "@/lib/runAction";
import { createCategory, createExpense, deleteExpense, restoreExpense, updateExpense, uploadMemo } from "@/services/books.services";
import type { ApiResult } from "@/types/api.types";
import type { ICategory, IExpense, IExpensePayload } from "@/types/books.types";
import { expensePayloadSchema } from "@/zod/books.validation";

const failed = async () => (await getTranslations("ExpenseForm"))("failed");

export const createExpenseAction = async (projectId: string, values: unknown): Promise<ApiResult<IExpense>> => {
  const parsed = expensePayloadSchema((await getMessages()).ExpenseForm.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);
  return runAction(await failed(), () => createExpense(projectId, parsed.data as IExpensePayload));
};

export const updateExpenseAction = async (projectId: string, id: string, values: unknown): Promise<ApiResult<IExpense>> => {
  const parsed = expensePayloadSchema((await getMessages()).ExpenseForm.validation).safeParse(values);
  if (!parsed.success) return toValidationError(parsed.error);
  return requireId(id, "expense") ?? runAction(await failed(), () => updateExpense(projectId, id, parsed.data as IExpensePayload));
};

// The memo photo comes as FormData ("memo") so the browser can send the file itself.
export const uploadMemoAction = async (projectId: string, id: string, form: FormData): Promise<ApiResult<null>> => {
  const photo = form.get("memo");
  if (!(photo instanceof Blob)) return { success: false, message: await failed() };
  return requireId(id, "expense") ?? runAction(await failed(), () => uploadMemo(projectId, id, photo));
};

export const createCategoryAction = async (projectId: string, name: string): Promise<ApiResult<ICategory>> =>
  runAction(await failed(), () => createCategory(projectId, name.trim()));

export const deleteExpenseAction = async (projectId: string, id: string, reason: string): Promise<ApiResult<null>> =>
  requireId(id, "expense") ?? runAction((await getTranslations("Expenses"))("failed"), () => deleteExpense(projectId, id, reason.trim()));

export const restoreExpenseAction = async (projectId: string, id: string): Promise<ApiResult<null>> =>
  requireId(id, "expense") ?? runAction((await getTranslations("Expenses"))("failed"), () => restoreExpense(projectId, id));
