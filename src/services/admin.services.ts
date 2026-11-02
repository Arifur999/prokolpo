"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IAdminOverview, IAdminUserDetail, IAdminUserPage } from "@/types/admin.types";

const user = (id: string) => `/admin/users/${encodeURIComponent(id)}`;

export const getAdminOverview = async () => httpClient.get<IAdminOverview>("/admin/overview");
export const getAdminBadges = async () => httpClient.get<{ openSupport: number }>("/admin/badges");

export const getAdminUsers = async (params: { filter: string; q: string; page: number }) => httpClient.get<IAdminUserPage>("/admin/users", { params });
export const getAdminUser = async (id: string) => httpClient.get<IAdminUserDetail>(user(id));
export const sendUserResetLink = async (id: string) => httpClient.post<null>(`${user(id)}/reset-link`);
export const issueUserResetCode = async (id: string, note: string) => httpClient.post<{ code: string; expiresAt: string }>(`${user(id)}/reset-code`, { note });
export const logoutUserEverywhere = async (id: string) => httpClient.post<null>(`${user(id)}/logout-all`);
export const changeUserPhone = async (id: string, body: { phone: string; reason: string; code: string }) => httpClient.post<null>(`${user(id)}/phone`, body);
export const setUserSuspended = async (id: string, suspend: boolean, body: { reason: string; code: string }) =>
  httpClient.post<null>(`${user(id)}/${suspend ? "suspend" : "unsuspend"}`, body);
export const addUserNote = async (id: string, body: string) => httpClient.post<null>(`${user(id)}/notes`, { body });
