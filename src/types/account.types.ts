import type { IUser } from "./auth.types";
import type { Ownership, ProjectKind, ProjectRole, ProjectStatus } from "./project.types";

// prokolpo-backend's Profile (GET /me/profile, board Profile).
export interface IProfile extends IUser {
  passwordChangedAt: string | null;
  projects: IProfileProject[];
}

export interface IProfileProject {
  id: string;
  name: string;
  kind: ProjectKind;
  ownership: Ownership;
  status: ProjectStatus;
  role: ProjectRole;
}

// One open login ("যেখানে লগইন করা আছে").
export interface IDevice {
  id: string;
  userAgent: string | null;
  ip: string | null;
  lastSeen: string;
  current: boolean;
}

export interface IProfilePayload {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
}
