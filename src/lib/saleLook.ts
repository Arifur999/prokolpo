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

// "2026-01-31" + 1 month -> "2026-02-28": the same day, or the month's last day.
export const addMonths = (iso: string, months: number) => {
  const [y = 2026, m = 1, d = 1] = iso.split("-").map(Number);
  const last = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m - 1 + months, Math.min(d, last))).toISOString().slice(0, 10);
};

// A sale's installments before it is saved, rounded as the API rounds them: even parts down
// to ৳100, the last one taking the rest.
export const planInstallments = (price: number, down: number, count: number, intervalMonths: number, firstDue: string) => {
  const rest = price - down;
  if (count <= 0 || rest <= 0 || !firstDue) return { each: 0, last: 0, rows: [] as { no: number; due: string; amount: number }[] };
  const each = Math.floor(rest / count / 100) * 100;
  const last = rest - each * (count - 1);
  const rows = Array.from({ length: count }, (_, i) => ({ no: i + 1, due: addMonths(firstDue, i * intervalMonths), amount: i === count - 1 ? last : each }));
  return { each, last, rows };
};

export type CustomerState = SaleState | "LEAD";

// A customer's state across their sales: not bought yet, behind on any, owing, or paid off.
export const customerState = (sales: Pick<ISale, "standing">[]): CustomerState =>
  !sales.length ? "LEAD" : sales.some((s) => s.standing.late) ? "LATE" : sales.some((s) => s.standing.due > 0) ? "RUNNING" : "PAID";
