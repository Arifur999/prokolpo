"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IAdminOverview } from "@/types/admin.types";

export const getAdminOverview = async () => httpClient.get<IAdminOverview>("/admin/overview");
export const getAdminBadges = async () => httpClient.get<{ openSupport: number }>("/admin/badges");
