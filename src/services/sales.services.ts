"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { ICustomer, ICustomerPayload, ISale, ISaleDetail, ISalePayload, ISaleReceipt, ISold, IUnit, IUnitPayload } from "@/types/sales.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;
const one = (id: string) => encodeURIComponent(id);

export const getUnits = async (projectId: string) => httpClient.get<IUnit[]>(`${base(projectId)}/units`);
export const addUnits = async (projectId: string, units: IUnitPayload[]) => httpClient.post<{ added: number }>(`${base(projectId)}/units`, { units });
export const updateUnit = async (projectId: string, unitId: string, unit: IUnitPayload) =>
  httpClient.put<null>(`${base(projectId)}/units/${one(unitId)}`, unit);
export const deleteUnit = async (projectId: string, unitId: string) => httpClient.delete<null>(`${base(projectId)}/units/${one(unitId)}`);

export const getCustomers = async (projectId: string) => httpClient.get<ICustomer[]>(`${base(projectId)}/customers`);
export const addCustomer = async (projectId: string, customer: ICustomerPayload) => httpClient.post<ICustomer>(`${base(projectId)}/customers`, customer);
export const getCustomer = async (projectId: string, customerId: string) => httpClient.get<ICustomer>(`${base(projectId)}/customers/${one(customerId)}`);

export const getSales = async (projectId: string) => httpClient.get<ISale[]>(`${base(projectId)}/sales`);
export const createSale = async (projectId: string, sale: ISalePayload) => httpClient.post<ISold>(`${base(projectId)}/sales`, sale);
export const getSale = async (projectId: string, saleId: string) => httpClient.get<ISaleDetail>(`${base(projectId)}/sales/${one(saleId)}`);
export const collect = async (projectId: string, saleId: string, payment: { amount: number; accountId: string; note: string }) =>
  httpClient.post<ISold>(`${base(projectId)}/sales/${one(saleId)}/payments`, payment);

export const getSaleReceipt = async (projectId: string, paymentId: string) =>
  httpClient.get<ISaleReceipt>(`${base(projectId)}/sale-payments/${one(paymentId)}/receipt`);
export const markSaleReceiptPrinted = async (projectId: string, paymentId: string) =>
  httpClient.post<null>(`${base(projectId)}/sale-payments/${one(paymentId)}/printed`);
