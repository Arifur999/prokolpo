"use server";

import { getTranslations } from "next-intl/server";
import { runAction } from "@/lib/runAction";
import { addExtra, createContractor, payContractor, saveAttendance } from "@/services/books.services";
import type { ApiResult } from "@/types/api.types";
import type { IContractor, IPaymentPayload, PayType } from "@/types/books.types";

export type ContractorFormValues = {
  name: string;
  phone: string;
  work: string;
  payType: PayType;
  contractAmount: number;
  scope: string;
  dailyWage: number;
  teamSize: number;
  openingDue: number;
};

const failed = async () => (await getTranslations("Contractors"))("failed");

// The API checks every field; its field errors come back to the form.
export const createContractorAction = async (projectId: string, values: ContractorFormValues): Promise<ApiResult<IContractor>> =>
  runAction(await failed(), () => createContractor(projectId, values));

export const payContractorAction = async (projectId: string, contractorId: string, payment: IPaymentPayload): Promise<ApiResult<null>> =>
  runAction((await getTranslations("PayDialog"))("failed"), () => payContractor(projectId, contractorId, payment));

export const addExtraAction = async (
  projectId: string,
  contractorId: string,
  extra: { title: string; amount: number; date: string },
): Promise<ApiResult<null>> => runAction(await failed(), () => addExtra(projectId, contractorId, extra));

export const saveAttendanceAction = async (
  projectId: string,
  cells: { contractorId: string; day: string; headcount: number; halfDay: boolean }[],
): Promise<ApiResult<null>> => runAction(await failed(), () => saveAttendance(projectId, cells));
