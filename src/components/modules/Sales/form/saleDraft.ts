import { addMonths, planInstallments } from "@/lib/saleLook";
import { normalizePhone } from "@/lib/phone";
import type { ISalePayload } from "@/types/sales.types";

// What the new-sale form holds. Money fields are digit strings so a half-typed number survives.
export type SaleDraft = {
  unitId: string;
  mode: "NEW" | "OLD";
  customer: { name: string; phone: string; nid: string; address: string };
  customerId: string;
  price: string;
  date: string;
  plan: "KIST" | "FULL";
  down: string;
  count: number;
  interval: 1 | 3 | 6;
  firstDue: string;
  accountId: string;
  print: boolean;
};

export const blankSale = (today: string, unitId: string, price: number, accountId: string): SaleDraft => ({
  unitId,
  mode: "NEW",
  customer: { name: "", phone: "", nid: "", address: "" },
  customerId: "",
  price: price ? String(price) : "",
  date: today,
  plan: "KIST",
  down: "",
  count: 24,
  interval: 1,
  firstDue: addMonths(today, 1),
  accountId,
  print: true,
});

export type SaleErrors = Partial<Record<"unit" | "name" | "phone" | "customer" | "price" | "date" | "down" | "firstDue", "required" | "invalid" | "tooSmall">>;

// The form's checks, matching the API's: who, how much, and installments that make sense.
export const saleErrors = (d: SaleDraft, today: string): SaleErrors => {
  const e: SaleErrors = {};
  const price = Number(d.price || 0);
  const down = d.plan === "FULL" ? price : Number(d.down || 0);
  if (!d.unitId) e.unit = "required";
  if (d.mode === "NEW") {
    if (d.customer.name.trim().length < 2) e.name = "required";
    if (!normalizePhone(d.customer.phone)) e.phone = "invalid";
  } else if (!d.customerId) e.customer = "required";
  if (!price) e.price = "required";
  if (!d.date || d.date > today) e.date = "invalid";
  if (d.plan === "KIST") {
    if (price && down >= price) e.down = "invalid";
    else if (price && !planInstallments(price, down, d.count, d.interval, d.firstDue).each) e.down = "tooSmall";
    if (!d.firstDue || d.firstDue <= d.date) e.firstDue = "invalid";
  }
  return e;
};

// The request body for a draft that passed saleErrors.
export const salePayload = (d: SaleDraft): ISalePayload => {
  const price = Number(d.price || 0);
  const kist = d.plan === "KIST";
  return {
    unitId: d.unitId,
    ...(d.mode === "NEW"
      ? { customer: { ...d.customer, name: d.customer.name.trim(), phone: normalizePhone(d.customer.phone) ?? "" } }
      : { customerId: d.customerId }),
    date: d.date,
    price,
    down: kist ? Number(d.down || 0) : price,
    installments: kist ? d.count : 0,
    intervalMonths: d.interval,
    firstDue: kist ? d.firstDue : "",
    accountId: d.accountId,
  };
};
