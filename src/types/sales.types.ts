// prokolpo-backend's sales views (internal/sales).
import type { ProjectRole } from "./project.types";

export const UNIT_TYPES = ["FLAT", "SHOP", "PARKING", "PLOT", "OTHER"] as const;
export type UnitType = (typeof UNIT_TYPES)[number];
export type UnitStatus = "AVAILABLE" | "BOOKED" | "SOLD";

export interface IRowDue {
  no: number;
  date: string;
  amount: number;
}

export interface IStanding {
  received: number;
  due: number;
  paidCount: number;
  next: IRowDue | null;
  late: (IRowDue & { days: number }) | null;
  lateCount: number;
  lateSum: number;
  status: Exclude<UnitStatus, "AVAILABLE">;
  lastPaid: string | null;
}

export interface ISale {
  id: string;
  unitId: string;
  unitName: string;
  unitType: UnitType;
  floor: number;
  size: number | null;
  listPrice: number;
  customerId: string;
  customer: string;
  phone: string;
  date: string;
  price: number;
  down: number;
  installments: number;
  intervalMonths: number;
  firstDue: string | null;
  installment: number;
  standing: IStanding;
  rows: IScheduleRow[] | null;
}

export interface IUnit {
  id: string;
  name: string;
  type: UnitType;
  floor: number;
  position: number;
  size: number | null;
  price: number;
  sale: ISale | null;
}

export interface IUnitPayload {
  name: string;
  type: UnitType;
  floor: number;
  size: number;
  price: number;
}

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  nid: string | null;
  address: string | null;
  createdAt: string;
  sales: ISale[];
}

export interface ICustomerPayload {
  name: string;
  phone: string;
  nid: string;
  address: string;
}

export interface IScheduleRow {
  no: number;
  due: string;
  amount: number;
  paid: number;
  paidOn: string | null;
  lastPaidOn: string | null;
}

export interface ISalePayment {
  id: string;
  kind: "DOWN" | "INSTALLMENT";
  date: string;
  amount: number;
  account: string;
  accountKind: "CASH" | "BANK" | "MOBILE";
  note: string | null;
  receiptNo: string;
  takenBy: string;
  createdAt: string;
}

export interface ISaleDetail {
  sale: ISale;
  nid: string | null;
  address: string | null;
  rows: IScheduleRow[];
  payments: ISalePayment[];
}

export interface ISalePayload {
  unitId: string;
  customerId?: string;
  customer?: ICustomerPayload;
  date: string;
  price: number;
  down: number;
  installments: number;
  intervalMonths: number;
  firstDue: string;
  accountId: string;
}

export interface ISold {
  saleId: string;
  paymentId: string | null;
  receiptNo: string | null;
}

export interface ISaleReceipt {
  paymentId: string;
  saleId: string;
  no: string;
  kind: "DOWN" | "INSTALLMENT";
  date: string;
  amount: number;
  payer: string;
  payerPhone: string;
  unit: string;
  unitType: UnitType;
  floor: number;
  size: number | null;
  project: string;
  location: string | null;
  company: string;
  ownerPhone: string;
  account: string;
  accountKind: "CASH" | "BANK" | "MOBILE";
  note: string | null;
  takenBy: string;
  takenByRole: ProjectRole | null;
  writtenAt: string;
  prints: number;
  price: number;
  paidSoFar: number;
  installments: number;
  covered: IScheduleRow[] | null;
  next: IRowDue | null;
  others: { paymentId: string; no: string; kind: "DOWN" | "INSTALLMENT"; date: string; amount: number }[];
}
