// prokolpo-backend's project views (internal/project/project.go).
export const PROJECT_KINDS = ["BUILDING", "FARM", "LAND", "BUSINESS", "RENOVATION", "OTHER"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const OWNERSHIPS = ["PERSONAL", "PARTNERSHIP"] as const;
export type Ownership = (typeof OWNERSHIPS)[number];

export const PROJECT_STATUSES = ["ACTIVE", "ON_HOLD", "DONE"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type ProjectRole = "OWNER" | "MANAGER" | "VIEWER";

export const FARM_TYPES = ["POULTRY", "CATTLE", "FISH", "CROP"] as const;
export type FarmType = (typeof FARM_TYPES)[number];

export const LAND_UNITS = ["SHOTANGSHO", "KATHA", "BIGHA"] as const;
export type LandUnit = (typeof LAND_UNITS)[number];

export interface IProjectSummary {
  id: string;
  name: string;
  kind: ProjectKind;
  ownership: Ownership;
  status: ProjectStatus;
  location: string | null;
  budget: number | null;
  spent: number;
  farmType: FarmType | null;
  floors: number | null;
  businessType: string | null;
  role: ProjectRole;
  memberCount: number;
  createdAt: string;
}

export interface IProjectPhase {
  id: string;
  name: string;
  budget: number | null;
  spent: number;
}

export interface IProject extends IProjectSummary {
  description: string | null;
  startDate: string;
  batches: number | null;
  plots: number | null;
  landArea: number | null;
  landUnit: LandUnit | null;
  phases: IProjectPhase[];
  accountCount: number;
}

export interface IDeletedProject {
  id: string;
  name: string;
  kind: ProjectKind;
  ownership: Ownership;
  farmType: FarmType | null;
  businessType: string | null;
  deletedAt: string;
  purgeAt: string;
  members: { name: string; role: ProjectRole }[];
}

export interface ICreateProjectPayload {
  name: string;
  kind: ProjectKind;
  ownership: Ownership;
  location: string;
  description: string;
  startDate: string;
  budget: number | null;
  farmType: FarmType | "";
  floors: number | null;
  batches: number | null;
  plots: number | null;
  landArea: number | null;
  landUnit: LandUnit | "";
  businessType: string;
  categories: string[];
  phases: string[];
}
