import type { ISale, IScheduleRow } from "@/types/sales.types";

export type SaleState = "RUNNING" | "LATE" | "PAID";

// Where a sale stands for the list's filters: paid off, behind, or on schedule.
export const saleState = (s: Pick<ISale, "standing">): SaleState => (s.standing.due <= 0 ? "PAID" : s.standing.late ? "LATE" : "RUNNING");

const left = (r: IScheduleRow) => r.amount - r.paid;

// Installments past their date and not fully paid, oldest first.
export const overdueRows = (s: Pick<ISale, "rows">, today: string) => (s.rows ?? []).filter((r) => left(r) > 0 && r.due.slice(0, 10) < today);

// Installments falling due in a month ("2026-10"), with their sale.
export const monthRows = (sales: ISale[], month: string) =>
  sales
    .flatMap((sale) => (sale.rows ?? []).filter((r) => r.due.slice(0, 7) === month).map((row) => ({ sale, row })))
    .sort((a, b) => a.row.due.localeCompare(b.row.due));

export type Allocation = { no: number; due: string; got: number; full: boolean; leftAfter: number };

// What a payment would settle, oldest installment first — the API fills them the same way.
export const allocate = (rows: IScheduleRow[], amount: number): Allocation[] => {
  let rest = amount;
  const out: Allocation[] = [];
  for (const r of rows) {
    if (rest <= 0) break;
    const need = left(r);
    if (need <= 0) continue;
    const got = Math.min(need, rest);
    rest -= got;
    out.push({ no: r.no, due: r.due, got, full: got === need, leftAfter: need - got });
  }
  return out;
};

// The next unpaid installments' running totals: one installment, two, then everything owed.
export const quickAmounts = (rows: IScheduleRow[], due: number) => {
  const open = rows.filter((r) => left(r) > 0);
  const first = open[0] ? left(open[0]) : 0;
  const two = open.slice(0, 2).reduce((n, r) => n + left(r), 0);
  return { first, two: open.length > 1 ? two : 0, all: due };
};
