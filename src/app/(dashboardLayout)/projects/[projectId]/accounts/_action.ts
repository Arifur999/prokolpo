"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { createAccount, transferMoney } from "@/services/books.services";
import type { ApiResult } from "@/types/api.types";
import type { AccountKind, IAccount } from "@/types/books.types";

const failed = async () => (await getTranslations("Accounts"))("failed");

export const createAccountAction = async (
  projectId: string,
  values: { name: string; kind: AccountKind; number: string; opening: number },
): Promise<ApiResult<IAccount>> => runAction(await failed(), () => createAccount(projectId, values));

export const transferAction = async (
  projectId: string,
  values: { fromAccountId: string; toAccountId: string; amount: number; note: string },
): Promise<ApiResult<null>> => runAction(await failed(), () => transferMoney(projectId, values));
