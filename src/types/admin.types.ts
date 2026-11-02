// prokolpo-backend's admin panel (internal/admin).
import type { StaffRole } from "./auth.types";
import type { ProjectKind } from "./project.types";

export interface IAuditLine {
  id: string;
  actorId: string | null;
  actor: string;
  action: string;
  summary: string;
  details: Record<string, string>;
  createdAt: string;
}

export interface IAdminOverview {
  users: { total: number; thisWeek: number; active30: number; bangla: number; english: number };
  projects: { total: number; running: number; joint: number; byKind: Partial<Record<ProjectKind, number>> };
  entries30: number;
  weeks: { start: string; count: number }[];
  months: { start: string; count: number }[];
  recent: {
    id: string;
    name: string;
    company: string | null;
    phone: string;
    hasEmail: boolean;
    locale: "bn" | "en";
    createdAt: string;
    kinds: ProjectKind[];
  }[];
  attention: {
    openSupport: number;
    oldestSupport: string | null;
    purgeSoon: number;
    firstPurge: string | null;
    suspended: number;
    lastSuspended: string | null;
    staff: number;
    staffWithout2fa: number;
  };
  audit: IAuditLine[];
}

export type UserFilterKind = "ALL" | "NEW" | "NOEMAIL" | "SUSPENDED" | "STAFF";

export interface IAdminUserRow {
  id: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  locale: "bn" | "en";
  status: "active" | "suspended";
  staffRole: StaffRole | null;
  createdAt: string;
  lastActive: string | null;
  owned: number;
  member: number;
  suspendedReason: string | null;
  openTicket: number | null;
}

export interface IAdminUserPage {
  rows: IAdminUserRow[];
  counts: Record<UserFilterKind, number>;
  total: number;
  page: number;
  pages: number;
}

export interface IAdminUserDetail {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string;
  email: string | null;
  locale: "bn" | "en";
  status: "active" | "suspended";
  staffRole: StaffRole | null;
  createdAt: string;
  lastActive: string | null;
  passwordChanged: string | null;
  invitedBy: string | null;
  invitedTo: string | null;
  suspendedAt: string | null;
  suspendedBy: string | null;
  suspendedReason: string | null;
  projects: {
    id: string;
    name: string;
    kind: ProjectKind;
    ownership: "PERSONAL" | "PARTNERSHIP";
    owner: string;
    ownerId: string;
    members: number;
    role: "OWNER" | "MANAGER" | "VIEWER";
    lastWork: string | null;
  }[];
  devices: { userAgent: string | null; ip: string | null; lastUsed: string }[];
  history: { kind: "login" | "fail" | "support" | "admin" | "password" | "join"; text: string; details: Record<string, string>; at: string }[];
  notes: { by: string; body: string; at: string }[];
  ticket: { id: string; number: number; topic: string; at: string } | null;
}
