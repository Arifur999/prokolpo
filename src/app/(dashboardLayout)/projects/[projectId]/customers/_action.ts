"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { addCustomer } from "@/services/sales.services";
import type { ApiResult } from "@/types/api.types";
import type { ICustomer, ICustomerPayload } from "@/types/sales.types";

export const addCustomerAction = async (projectId: string, customer: ICustomerPayload): Promise<ApiResult<ICustomer>> =>
  runAction((await getTranslations("Customers"))("failed"), () => addCustomer(projectId, customer));
