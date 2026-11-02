"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { markSaleReceiptPrinted } from "@/services/sales.services";
import type { ApiResult } from "@/types/api.types";

// Bound to one payment by the page, then called by the print button.
export const markPaymentPrintedAction = async (projectId: string, paymentId: string): Promise<ApiResult<null>> =>
  runAction((await getTranslations("Receipts"))("failed"), () => markSaleReceiptPrinted(projectId, paymentId));
