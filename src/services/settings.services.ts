"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { ICategoryPayload, IExportSheet, IGeneralPayload, IPhasePayload, IReceiptPayload, ISettings, ISettingsCategory } from "@/types/settings.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}/settings`;

export const getSettings = async (projectId: string) => httpClient.get<ISettings>(base(projectId));

export const saveGeneral = async (projectId: string, payload: IGeneralPayload) => httpClient.put<null>(`${base(projectId)}/general`, payload);

export const savePhases = async (projectId: string, phases: IPhasePayload[]) => httpClient.put<null>(`${base(projectId)}/phases`, { phases });

export const addCategory = async (projectId: string, payload: ICategoryPayload) => httpClient.post<ISettingsCategory>(`${base(projectId)}/categories`, payload);

export const updateCategory = async (projectId: string, id: string, payload: ICategoryPayload) =>
  httpClient.patch<null>(`${base(projectId)}/categories/${encodeURIComponent(id)}`, payload);

export const deleteCategory = async (projectId: string, id: string) => httpClient.delete<null>(`${base(projectId)}/categories/${encodeURIComponent(id)}`);

export const saveReceipt = async (projectId: string, payload: IReceiptPayload) => httpClient.put<null>(`${base(projectId)}/receipt`, payload);

export const grantSupport = async (projectId: string, hours: number) => httpClient.post<null>(`${base(projectId)}/support`, { hours });

export const revokeSupport = async (projectId: string) => httpClient.delete<null>(`${base(projectId)}/support`);

export const transferOwnership = async (projectId: string, userId: string) => httpClient.post<null>(`${base(projectId)}/owner`, { userId });

export const exportProject = async (projectId: string) => httpClient.get<IExportSheet[]>(`${base(projectId)}/export`);
