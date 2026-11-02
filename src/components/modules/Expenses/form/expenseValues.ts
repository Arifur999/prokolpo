import type { IExpense, IExpensePayload, PartyKind } from "@/types/books.types";

// The units on board ExpenseNew.
export const UNITS = ["টন", "বস্তা", "কেজি", "সিএফটি", "পিস", "ফুট", "বর্গফুট", "লিটার", "ট্রিপ", "দিন"] as const;

// What the expense form holds. Money fields are digit strings so a half-typed number survives.
export type ExpenseValues = {
  categoryId: string;
  quantity: string;
  unit: string;
  rate: string;
  amount: string;
  // The person typed the total; otherwise it follows quantity × rate.
  amountManual: boolean;
  partyKind: PartyKind;
  supplierId: string;
  contractorId: string;
  phaseId: string;
  date: string;
  description: string;
  paidNow: boolean;
  accountId: string;
  reason: string;
};

export const blankExpense = (today: string, firstSupplier = "", cashAccount = ""): ExpenseValues => ({
  categoryId: "",
  quantity: "",
  unit: UNITS[0],
  rate: "",
  amount: "",
  amountManual: false,
  partyKind: firstSupplier ? "SUPPLIER" : "NONE",
  supplierId: firstSupplier,
  contractorId: "",
  phaseId: "",
  date: today,
  description: "",
  paidNow: false,
  accountId: cashAccount,
  reason: "",
});

// The form as it starts for an existing bill.
export const valuesFromExpense = (e: IExpense): ExpenseValues => ({
  categoryId: e.categoryId,
  quantity: e.quantity ? String(Number(e.quantity)) : "",
  unit: e.unit ?? UNITS[0],
  rate: e.rate ? String(e.rate) : "",
  amount: String(e.amount),
  // Typed by hand only if it differs from quantity × rate.
  amountManual: !(e.quantity && e.rate && Math.round(Number(e.quantity) * e.rate) === e.amount),
  partyKind: e.supplierId ? "SUPPLIER" : e.contractorId ? "CONTRACTOR" : "NONE",
  supplierId: e.supplierId ?? "",
  contractorId: e.contractorId ?? "",
  phaseId: e.phaseId ?? "",
  date: e.date,
  description: e.description ?? "",
  paidNow: e.paidNow,
  accountId: "",
  reason: "",
});

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

// Keeps digits and one decimal point, up to 3 decimals ("5", "2.5", "0.125"); Bangla digits work.
export const cleanQuantity = (raw: string) => {
  const ascii = raw.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d))).replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = ascii.split(".");
  return rest.length ? `${whole.slice(0, 11)}.${rest.join("").slice(0, 3)}` : whole.slice(0, 11);
};

// quantity × rate, rounded to whole taka; 0 when either is missing.
export const autoAmount = (v: Pick<ExpenseValues, "quantity" | "rate">) => {
  const quantity = Number(v.quantity);
  const rate = Number(v.rate);
  return quantity > 0 && rate > 0 ? Math.round(quantity * rate) : 0;
};

// The total the bill will be saved with.
export const amountOf = (v: ExpenseValues) => (v.amountManual ? Number(v.amount || 0) : autoAmount(v) || Number(v.amount || 0));

export const partyIdOf = (v: ExpenseValues) => (v.partyKind === "SUPPLIER" ? v.supplierId : v.partyKind === "CONTRACTOR" ? v.contractorId : "");

export type ExpenseErrors = Partial<Record<"amount" | "categoryId" | "partyId", true>>;

export const expenseErrors = (v: ExpenseValues): ExpenseErrors => ({
  ...(amountOf(v) > 0 ? {} : { amount: true }),
  ...(v.categoryId ? {} : { categoryId: true }),
  ...(v.partyKind !== "NONE" && !partyIdOf(v) ? { partyId: true } : {}),
});

export const toPayload = (v: ExpenseValues): IExpensePayload => ({
  categoryId: v.categoryId,
  phaseId: v.phaseId,
  partyKind: v.partyKind,
  partyId: partyIdOf(v),
  date: v.date,
  quantity: v.quantity && Number(v.quantity) > 0 ? v.quantity.replace(/\.$/, "") : "",
  unit: v.quantity ? v.unit : "",
  rate: v.rate ? Number(v.rate) : null,
  amount: amountOf(v),
  description: v.description.trim(),
  paidNow: v.paidNow,
  accountId: v.paidNow ? v.accountId : "",
  reason: v.reason.trim(),
});
