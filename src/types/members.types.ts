// prokolpo-backend's team and activity views (internal/members, internal/timeline).
export type TeamRole = "MANAGER" | "VIEWER";

export interface IMember {
  userId: string;
  name: string;
  phone: string;
  role: "OWNER" | TeamRole;
  isYou: boolean;
  isPartner: boolean;
  joinedAt: string;
  lastActive: string | null;
  entries: number;
}

export interface IInvite {
  id: string;
  phone: string;
  role: TeamRole;
  invitedBy: string;
  createdAt: string;
}

export interface ITeam {
  members: IMember[];
  invites: IInvite[];
}

export type LookupStatus = "MEMBER" | "PENDING" | "FOUND" | "NEW";

export interface ILookup {
  status: LookupStatus;
  name: string | null;
}

export interface IAdded {
  status: "MEMBER" | "PENDING";
  name: string | null;
  phone: string;
}

export interface IResetCode {
  code: string;
  expiresAt: string;
}

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE" | "RESTORE";

export interface IActivityItem {
  id: string;
  action: ActivityAction;
  entity: string;
  entityId: string;
  summary: string;
  changes: { field: string; before: string; after: string }[];
  reason: string | null;
  details: Record<string, string>;
  actorId: string;
  actorName: string;
  createdAt: string;
  title: string | null;
  quantity: string | null;
  unit: string | null;
  amount: number | null;
  party: string | null;
  account: string | null;
  otherAccount: string | null;
  purpose: string | null;
  note: string | null;
  phase: string | null;
  paidNow: boolean;
  deleted: boolean;
}

export interface IActivityWeek {
  from: string;
  counts: { userId: string; name: string; count: number }[];
}
