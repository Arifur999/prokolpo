// prokolpo-backend's partner views (internal/partners).
import type { ProjectRole } from "./project.types";
import type { IReceiptPrint } from "./settings.types";

export interface IPartner {
  id: string;
  name: string;
  phone: string;
  share: number;
  committed: number;
  joinedOn: string;
  color: number;
  callShare: number;
  paid: number;
  role: ProjectRole | null;
  hasAccount: boolean;
  invited: boolean;
}

export interface ICallPart {
  partnerId: string;
  name: string;
  color: number;
  share: number;
  amount: number;
  paid: number;
}

export interface ICapitalCall {
  id: string;
  date: string;
  dueDate: string;
  reason: string;
  total: number;
  parts: ICallPart[];
}

export interface IPartnerBoard {
  partners: IPartner[];
  calls: ICapitalCall[];
}

export interface IPartnerLookup {
  status: "PARTNER" | "MEMBER" | "ACCOUNT" | "NONE";
  name: string | null;
  role: ProjectRole | null;
}

export interface INewPartnerPayload {
  phone: string;
  name: string;
  share: number;
  committed: number;
  joinedOn: string;
  shares: Record<string, number>;
  viewer: boolean;
}

export interface IDepositPayload {
  amount: number;
  accountId: string;
  callId: string;
  note: string;
}

export interface IPartnerEntry {
  kind: "DUE" | "PAID";
  date: string;
  amount: number;
  callId: string | null;
  callDate: string | null;
  reason: string | null;
  callTotal: number | null;
  account: string | null;
  note: string | null;
  depositId: string | null;
  receiptNo: string | null;
}

export interface IPartnerDetail {
  partner: IPartner;
  totalCommitted: number;
  projectPaid: number;
  entries: IPartnerEntry[];
  calls: ICapitalCall[];
}

export interface IReceiptBrief {
  depositId: string;
  no: string;
  date: string;
  amount: number;
  callDate: string | null;
}

export interface IPartnerReceipt {
  depositId: string;
  no: string;
  date: string;
  amount: number;
  partnerId: string;
  payer: string;
  payerPhone: string;
  share: number;
  project: string;
  location: string | null;
  company: string;
  ownerPhone: string;
  // How the owner set receipts up in settings.
  print: IReceiptPrint;
  callDate: string | null;
  reason: string | null;
  callTotal: number | null;
  totalBase: number;
  account: string;
  accountKind: "CASH" | "BANK" | "MOBILE";
  note: string | null;
  takenBy: string;
  takenByRole: ProjectRole | null;
  writtenAt: string;
  prints: number;
  should: number;
  paidSoFar: number;
  others: IReceiptBrief[];
}
