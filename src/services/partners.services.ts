"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type {
  IDepositPayload,
  INewPartnerPayload,
  IPartner,
  IPartnerBoard,
  IPartnerDetail,
  IPartnerLookup,
  IPartnerReceipt,
  ICapitalCall,
} from "@/types/partners.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;
const one = (id: string) => encodeURIComponent(id);

export const getPartnerBoard = async (projectId: string) => httpClient.get<IPartnerBoard>(`${base(projectId)}/partners`);

export const lookupPartner = async (projectId: string, phone: string) =>
  httpClient.get<IPartnerLookup>(`${base(projectId)}/partners/lookup`, { params: { phone } });

export const addPartner = async (projectId: string, payload: INewPartnerPayload) => httpClient.post<IPartner>(`${base(projectId)}/partners`, payload);

export const getPartner = async (projectId: string, partnerId: string) => httpClient.get<IPartnerDetail>(`${base(projectId)}/partners/${one(partnerId)}`);

export const depositFor = async (projectId: string, partnerId: string, payload: IDepositPayload) =>
  httpClient.post<{ id: string; receiptNo: string }>(`${base(projectId)}/partners/${one(partnerId)}/deposits`, payload);

export const createCall = async (projectId: string, total: number, reason: string) =>
  httpClient.post<ICapitalCall>(`${base(projectId)}/capital-calls`, { total, reason });

export const getPartnerReceipt = async (projectId: string, depositId: string) =>
  httpClient.get<IPartnerReceipt>(`${base(projectId)}/partner-deposits/${one(depositId)}/receipt`);

export const markReceiptPrinted = async (projectId: string, depositId: string) =>
  httpClient.post<null>(`${base(projectId)}/partner-deposits/${one(depositId)}/printed`);
