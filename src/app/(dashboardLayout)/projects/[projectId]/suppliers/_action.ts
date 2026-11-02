"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { createSupplier, getExpenses, paySupplier } from "@/services/books.services";
import type { ApiResult } from "@/types/api.types";
import type { IExpense, IPaymentPayload, ISupplier } from "@/types/books.types";

export type SupplierFormValues = {
  name: string;
  phone: string;
  address: string;
  supplies: string[];
  openingDue: number;
  note: string;
};

// The API checks the name, phone and supplies; its field errors come back to the form.
export const createSupplierAction = async (projectId: string, values: SupplierFormValues): Promise<ApiResult<ISupplier>> =>
  runAction((await getTranslations("Suppliers"))("failed"), () => createSupplier(projectId, values));

export const paySupplierAction = async (projectId: string, supplierId: string, payment: IPaymentPayload): Promise<ApiResult<null>> =>
  runAction((await getTranslations("PayDialog"))("failed"), () => paySupplier(projectId, supplierId, payment));

// The bills of a supplier still not paid in full, for "কোন বিলের জন্য".
export const openBillsAction = async (projectId: string, supplierId: string): Promise<IExpense[]> => {
  try {
    const page = await getExpenses(projectId, { party: supplierId, paid: "credit", limit: "20" });
    return page.data.items.filter((bill) => bill.amount > bill.paidOnBill);
  } catch {
    return [];
  }
};
