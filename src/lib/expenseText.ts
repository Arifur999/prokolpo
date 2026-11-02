import type { IExpense } from "@/types/books.types";
import { formatAmount } from "./money";

// "5 টন × ৳ 95,000": what was bought, when a quantity was entered.
export const quantityLine = (e: Pick<IExpense, "quantity" | "unit" | "rate">) => {
  if (!e.quantity) return null;
  const amount = `${formatAmount(Number(e.quantity))}${e.unit ? ` ${e.unit}` : ""}`;
  return e.rate ? `${amount} × ৳ ${formatAmount(e.rate)}` : amount;
};

// A bill's two lines in the list (board ExpenseList): the description, or the head when
// there is none; under it the quantity, or the head when the description took the title.
export const expenseLines = (e: IExpense) => ({
  title: e.description ?? e.categoryName,
  sub: quantityLine(e) ?? (e.description ? e.categoryName : ""),
});

// "2026-09-30" -> "30/09/2026".
export const dayFirst = (iso: string) => iso.split("-").reverse().join("/");
