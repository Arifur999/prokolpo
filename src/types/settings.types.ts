import type { FarmType, Ownership, ProjectKind, ProjectRole, ProjectStatus } from "./project.types";

// prokolpo-backend's settings.Settings (GET /projects/{id}/settings, board Settings).
export interface ISettings {
  role: ProjectRole;
  general: ISettingsGeneral;
  phases: ISettingsPhase[];
  categories: ISettingsCategory[];
  receipt: IReceiptSettings;
  support: ISupportGrant | null;
  members: ITransferMember[];
  counts: { expenses: number; sales: number; partners: number; receipts: number; members: number };
}

export interface ISettingsGeneral {
  name: string;
  kind: ProjectKind;
  ownership: Ownership;
  farmType: FarmType | null;
  floors: number | null;
  businessType: string | null;
  location: string | null;
  description: string | null;
  startDate: string;
  status: ProjectStatus;
  partners: number;
}

export interface ISettingsPhase {
  id: string;
  name: string;
  budget: number | null;
  spent: number;
  locked: boolean;
}

export interface ISettingsCategory {
  id: string;
  name: string;
  entries: number;
  spent: number;
  budget: number | null;
  hidden: boolean;
}

export const RECEIPT_LANGS = ["bn", "en", "both"] as const;
export type ReceiptLang = (typeof RECEIPT_LANGS)[number];
export const PAPERS = ["A4", "A5"] as const;
export type Paper = (typeof PAPERS)[number];

// What a printed receipt takes from settings.
export interface IReceiptPrint {
  lang: ReceiptLang;
  paper: Paper;
  footer: string | null;
}

export interface IReceiptSettings {
  company: string;
  address: string;
  phone: string;
  prefix: string;
  lang: ReceiptLang;
  paper: Paper;
  footer: string;
  next: number;
}

export interface ISupportGrant {
  startsAt: string;
  endsAt: string;
  grantedBy: string;
  lastOpenedBy: string | null;
  lastOpenedAt: string | null;
}

export interface ITransferMember {
  userId: string;
  name: string;
  role: ProjectRole;
  share: number | null;
}

export interface IGeneralPayload {
  name: string;
  location: string;
  description: string;
  startDate: string;
  status: ProjectStatus;
}

export interface IPhasePayload {
  id: string;
  name: string;
  budget: number | null;
}

export interface ICategoryPayload {
  name: string;
  budget: number | null;
  hidden: boolean;
}

export type IReceiptPayload = Omit<IReceiptSettings, "next">;

// One tab of the backup workbook; key and columns are message keys.
export interface IExportSheet {
  key: string;
  columns: string[];
  rows: (string | number | null)[][];
}
