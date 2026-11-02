"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IStaffEnabled, IStaffSetup, IStaffStatus, IStaffVerified } from "@/types/staff.types";

export const getStaffStatus = async () => httpClient.get<IStaffStatus>("/admin/2fa");
export const beginStaffSetup = async () => httpClient.post<IStaffSetup>("/admin/2fa/setup");
export const enableStaffTwoFactor = async (code: string) => httpClient.post<IStaffEnabled>("/admin/2fa/enable", { code });
export const verifyStaffCode = async (code: string, backup: boolean) => httpClient.post<IStaffVerified>("/admin/2fa/verify", { code, backup });
export const checkAdminSession = async () => httpClient.get<null>("/admin/session");
export const endAdminSession = async () => httpClient.post<null>("/admin/session/end");
