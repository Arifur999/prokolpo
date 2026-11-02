"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { markReceiptPrinted } from "@/services/partners.services";
import type { ApiResult } from "@/types/api.types";

// Bound to one deposit by the page, then called by the print button.
export const markPrintedAction = async (projectId: string, depositId: string): Promise<ApiResult<null>> =>
  runAction((await getTranslations("Receipts"))("failed"), () => markReceiptPrinted(projectId, depositId));
