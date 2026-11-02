// prokolpo-backend's admin panel (internal/admin).
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
