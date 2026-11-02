import type { IExpenseReport } from "@/types/books.types";

// A chart's top line: the smallest round step (1, 2, 5 × 10ⁿ) that fits `max` in `parts` grid lines.
export const niceTop = (max: number, parts = 3) => {
  if (max <= 0) return parts;
  const raw = max / parts;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power;
  return step * parts;
};

export type ExpenseRow = { name: string; amount: number };

// Heads by spending, labour named in the reader's language; unused heads stay in, at 0.
export const headRows = (r: IExpenseReport, labour: string): ExpenseRow[] =>
  r.categories.map((c) => ({ name: c.labour ? labour : c.name, amount: c.amount })).sort((a, b) => b.amount - a.amount);

export type PhaseRow = { name: string; amount: number; budget: number | null; unphased?: boolean };

// Phases in order, then what fell outside any phase.
export const phaseRows = (r: IExpenseReport, noPhase: string): PhaseRow[] => [
  ...r.phases,
  ...(r.unphased ? [{ name: noPhase, amount: r.unphased, budget: null, unphased: true }] : []),
];

export const supplierRows = (r: IExpenseReport) => r.suppliers.map((s) => ({ ...s, due: s.billed - s.paid }));

// The month grouping: total, average over the months shown, and the busiest month.
export const monthStats = (months: IExpenseReport["months"]) => {
  const total = months.reduce((n, m) => n + m.amount, 0);
  const top = months.reduce((best, m) => (m.amount > best.amount ? m : best), months[0] ?? { month: "", amount: 0 });
  return { total, average: months.length ? total / months.length : 0, top };
};

// A phase's use of its budget, as the bar shows it: up to 120% fits the track.
export const BUDGET_SCALE = 120;
export const phaseUse = (row: PhaseRow) => (row.budget ? (row.amount / row.budget) * 100 : null);
