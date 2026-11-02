"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { IActivityItem, IActivityWeek, IAdded, ILookup, IResetCode, ITeam, TeamRole } from "@/types/members.types";

const base = (projectId: string) => `/projects/${encodeURIComponent(projectId)}`;
const one = (id: string) => encodeURIComponent(id);

export const getTeam = async (projectId: string) => httpClient.get<ITeam>(`${base(projectId)}/members`);

export const lookupPhone = async (projectId: string, phone: string) => httpClient.get<ILookup>(`${base(projectId)}/members/lookup`, { params: { phone } });

export const inviteMember = async (projectId: string, phone: string, role: TeamRole) => httpClient.post<IAdded>(`${base(projectId)}/members`, { phone, role });

export const changeRole = async (projectId: string, userId: string, role: TeamRole) =>
  httpClient.patch<null>(`${base(projectId)}/members/${one(userId)}`, { role });

export const removeMember = async (projectId: string, userId: string) => httpClient.delete<null>(`${base(projectId)}/members/${one(userId)}`);

export const issueResetCode = async (projectId: string, userId: string) => httpClient.post<IResetCode>(`${base(projectId)}/members/${one(userId)}/reset-code`);

export const cancelInvite = async (projectId: string, inviteId: string) => httpClient.delete<null>(`${base(projectId)}/invites/${one(inviteId)}`);

export const getActivity = async (projectId: string, params: Record<string, string>) =>
  httpClient.get<IActivityItem[]>(`${base(projectId)}/activity`, { params });

export const getActivityWeek = async (projectId: string) => httpClient.get<IActivityWeek>(`${base(projectId)}/activity/week`);
