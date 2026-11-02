"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IDevice, IProfile, IProfilePayload } from "@/types/account.types";
import type { IUser } from "@/types/auth.types";

// The signed-in account's own page (board Profile). The password change lives in
// auth.services.ts because it hands back a new session's raw tokens.

export const getProfile = async () => httpClient.get<IProfile>("/me/profile");

export const updateProfile = async (payload: IProfilePayload) => httpClient.patch<IUser>("/me/profile", payload);

export const saveLocale = async (locale: string) => httpClient.put<null>("/me/locale", { locale });

export const changePhone = async (phone: string, password: string) => httpClient.post<IUser>("/me/phone", { phone, password });

export const deleteAccount = async (password: string) => httpClient.post<null>("/me/delete", { password });

export const getDevices = async () => httpClient.get<IDevice[]>("/me/devices");

export const endDevice = async (id: string) => httpClient.delete<null>(`/me/devices/${encodeURIComponent(id)}`);

export const endOtherDevices = async () => httpClient.post<{ ended: number }>("/me/devices/end-others");
