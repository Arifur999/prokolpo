// prokolpo-backend's books views (internal/books).

export type PartyKind = "SUPPLIER" | "CONTRACTOR" | "NONE";
export type AccountKind = "CASH" | "BANK" | "MOBILE";
export type PayType = "CONTRACT" | "DAILY";
export type ContractorStatus = "NOT_STARTED" | "WORKING" | "DONE";
export type PaymentPurpose = "WAGE" | "ADVANCE" | "INSTALL" | "EXTRA" | "FINAL" | "OTHER";

export interface ICategory {
  id: string;
  name: string;
}

export interface IExpense {
  id: string;
  date: string;
  categoryId: string;
  categoryName: string;
  phaseId: string | null;
  phaseName: string | null;
  supplierId: string | null;
  contractorId: string | null;
  partyName: string | null;
  quantity: string | null;
  unit: string | null;
  rate: number | null;
  amount: number;
  description: string | null;
  hasMemo: boolean;
  paidNow: boolean;
  paidAccount: string | null;
  paidOnBill: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseSummary {
  count: number;
  total: number;
  credit: number;
  cash: number;
  topCategory: string | null;
  topAmount: number;
}

export interface IExpensePage {
  items: IExpense[];
  summary: IExpenseSummary;
}

export interface IExpensePayload {
  categoryId: string;
  phaseId: string;
  partyKind: PartyKind;
  partyId: string;
  date: string;
  quantity: string;
  unit: string;
  rate: number | null;
  amount: number;
  description: string;
  paidNow: boolean;
  accountId: string;
  reason?: string;
}

export interface ISupplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  supplies: string[];
  note: string | null;
  openingDue: number;
  billed: number;
  paid: number;
  due: number;
  billCount: number;
  paymentCount: number;
  lastDate: string | null;
  oldestDueDate: string | null;
  createdAt: string;
}

export interface ILedgerLine {
  ref: string;
  kind: "OPENING" | "BILL" | "PAYMENT" | "CONTRACT" | "EXTRA" | "WEEK";
  date: string;
  title: string | null;
  detail: string | null;
  charge: number;
  payment: number;
  due: number;
  account: string | null;
  purpose: PaymentPurpose | null;
}

export interface ISupplierDetail {
  supplier: ISupplier;
  lines: ILedgerLine[];
}

export interface IContractor {
  id: string;
  name: string;
  phone: string | null;
  work: string;
  payType: PayType;
  contractAmount: number | null;
  scope: string | null;
  dailyWage: number | null;
  teamSize: number | null;
  status: ContractorStatus;
  openingDue: number;
  extras: number;
  wages: number;
  manDays: number;
  bills: number;
  total: number;
  paid: number;
  due: number;
  lastPayDate: string | null;
  lastPayAmount: number | null;
  createdAt: string;
}

export interface IAttendanceDay {
  day: string;
  headcount: number;
  halfDay: boolean;
  rate: number;
}

export interface IContractorDetail {
  contractor: IContractor;
  lines: ILedgerLine[];
  days: IAttendanceDay[];
}

export interface ITeamWeek {
  contractorId: string;
  name: string;
  work: string;
  dailyWage: number;
  teamSize: number;
  due: number;
  days: IAttendanceDay[];
}

export interface IAttendanceWeek {
  weekStart: string;
  today: string;
  teams: ITeamWeek[];
}

export interface IAccount {
  id: string;
  name: string;
  kind: AccountKind;
  number: string | null;
  opening: number;
  balance: number;
  lastDate: string | null;
  lastMove: number | null;
  createdAt: string;
}

export interface IMovement {
  ref: string;
  kind: "OPENING" | "PAYMENT" | "BUY" | "DEPOSIT" | "TRANSFER_IN" | "TRANSFER_OUT";
  accountId: string;
  accountName: string;
  date: string;
  amount: number;
  party: string | null;
  title: string | null;
  note: string | null;
  otherAccount: string | null;
  balance: number;
  createdAt: string;
}

export interface IOverviewData {
  figures: {
    cash: number;
    supplierDue: number;
    supplierCount: number;
    contractorDue: number;
    contractorCount: number;
    monthSpent: number;
    lastMonthSpent: number;
  };
  months: { month: string; amount: number }[];
  categories: { name: string; amount: number; labour: boolean }[];
  recent: {
    ref: string;
    kind: "EXPENSE" | "PAYMENT";
    date: string;
    title: string | null;
    detail: string | null;
    party: string | null;
    phase: string | null;
    account: string | null;
    quantity: string | null;
    unit: string | null;
    amount: number;
    expenseId: string | null;
  }[];
}

export interface IPaymentPayload {
  accountId: string;
  amount: number;
  date: string;
  expenseId?: string;
  purpose?: PaymentPurpose;
  note: string;
}
