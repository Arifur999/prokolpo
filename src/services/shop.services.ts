"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IShopBook, IShopDayPayload } from "@/types/shop.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;

export const getShopBook = async (projectId: string) => httpClient.get<IShopBook>(`${base(projectId)}/shop`);
export const saveShopDay = async (projectId: string, day: IShopDayPayload) => httpClient.put<null>(`${base(projectId)}/shop/days`, day);
export const collectKhata = async (projectId: string, personId: string, payment: { amount: number; accountId: string }) =>
  httpClient.post<null>(`${base(projectId)}/shop/khata/${encodeURIComponent(personId)}/payments`, payment);
