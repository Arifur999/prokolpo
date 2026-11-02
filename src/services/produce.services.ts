"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IBatchPayload, IProduceBook, IProduceSalePayload } from "@/types/produce.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;

export const getProduceBook = async (projectId: string) => httpClient.get<IProduceBook>(`${base(projectId)}/produce`);
export const createProduceSale = async (projectId: string, sale: IProduceSalePayload) =>
  httpClient.post<{ id: string; amount: number; left: number }>(`${base(projectId)}/produce`, sale);
export const collectFromBuyer = async (projectId: string, buyerId: string, payment: { amount: number; accountId: string }) =>
  httpClient.post<null>(`${base(projectId)}/produce/buyers/${encodeURIComponent(buyerId)}/payments`, payment);
export const updateBatch = async (projectId: string, phaseId: string, batch: IBatchPayload) =>
  httpClient.put<null>(`${base(projectId)}/batches/${encodeURIComponent(phaseId)}`, batch);
