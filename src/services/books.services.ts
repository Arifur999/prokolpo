"use server";

import { cache } from "react";
import { httpClient } from "@/lib/axios/httpClient";
import type {
  IAccount,
  IAttendanceWeek,
  ICategory,
  IContractor,
  IContractorDetail,
  IExpense,
  IExpensePage,
  IExpensePayload,
  IMovement,
  IOverviewData,
  IPaymentPayload,
  ISupplier,
  ISupplierDetail,
} from "@/types/books.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;
const one = (id: string) => encodeURIComponent(id);

export const getOverview = async (projectId: string) => httpClient.get<IOverviewData>(`${base(projectId)}/overview`);

export const getCategories = cache(async (projectId: string) => httpClient.get<ICategory[]>(`${base(projectId)}/categories`));
export const createCategory = async (projectId: string, name: string) => httpClient.post<ICategory>(`${base(projectId)}/categories`, { name });

export const getExpenses = async (projectId: string, params: Record<string, string>) => httpClient.get<IExpensePage>(`${base(projectId)}/expenses`, { params });
export const getExpense = async (projectId: string, id: string) => httpClient.get<IExpense>(`${base(projectId)}/expenses/${one(id)}`);
export const createExpense = async (projectId: string, payload: IExpensePayload) => httpClient.post<IExpense>(`${base(projectId)}/expenses`, payload);
export const updateExpense = async (projectId: string, id: string, payload: IExpensePayload) =>
  httpClient.put<IExpense>(`${base(projectId)}/expenses/${one(id)}`, payload);
export const deleteExpense = async (projectId: string, id: string, reason: string) =>
  httpClient.post<null>(`${base(projectId)}/expenses/${one(id)}/delete`, { reason });
export const restoreExpense = async (projectId: string, id: string) => httpClient.post<null>(`${base(projectId)}/expenses/${one(id)}/restore`);

export const getSuppliers = cache(async (projectId: string) => httpClient.get<ISupplier[]>(`${base(projectId)}/suppliers`));
export const getSupplier = async (projectId: string, id: string) => httpClient.get<ISupplierDetail>(`${base(projectId)}/suppliers/${one(id)}`);
export const createSupplier = async (projectId: string, payload: unknown) => httpClient.post<ISupplier>(`${base(projectId)}/suppliers`, payload);
export const paySupplier = async (projectId: string, id: string, payload: IPaymentPayload) =>
  httpClient.post<null>(`${base(projectId)}/suppliers/${one(id)}/payments`, payload);

export const getContractors = cache(async (projectId: string) => httpClient.get<IContractor[]>(`${base(projectId)}/contractors`));
export const getContractor = async (projectId: string, id: string) => httpClient.get<IContractorDetail>(`${base(projectId)}/contractors/${one(id)}`);
export const createContractor = async (projectId: string, payload: unknown) => httpClient.post<IContractor>(`${base(projectId)}/contractors`, payload);
export const payContractor = async (projectId: string, id: string, payload: IPaymentPayload) =>
  httpClient.post<null>(`${base(projectId)}/contractors/${one(id)}/payments`, payload);
export const addExtra = async (projectId: string, id: string, payload: { title: string; amount: number; date: string }) =>
  httpClient.post<null>(`${base(projectId)}/contractors/${one(id)}/extras`, payload);

export const getAttendance = async (projectId: string, week?: string) =>
  httpClient.get<IAttendanceWeek>(`${base(projectId)}/attendance`, { params: week ? { week } : undefined });
export const saveAttendance = async (projectId: string, cells: { contractorId: string; day: string; headcount: number; halfDay: boolean }[]) =>
  httpClient.put<null>(`${base(projectId)}/attendance`, { cells });

export const getAccounts = cache(async (projectId: string) => httpClient.get<IAccount[]>(`${base(projectId)}/accounts`));
export const getAccountLedger = async (projectId: string) => httpClient.get<IMovement[]>(`${base(projectId)}/accounts/ledger`);
export const createAccount = async (projectId: string, payload: unknown) => httpClient.post<IAccount>(`${base(projectId)}/accounts`, payload);
export const transferMoney = async (projectId: string, payload: { fromAccountId: string; toAccountId: string; amount: number; note: string }) =>
  httpClient.post<null>(`${base(projectId)}/transfers`, payload);
