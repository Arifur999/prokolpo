import { budgetTone, formatAmount, formatPercent } from "@/lib/money";
import { BUDGET_SCALE, headRows, phaseRows, phaseUse, supplierRows } from "@/lib/reportExpense";
import type { IExpenseReport } from "@/types/books.types";
import type { Line, LineCell } from "./ExpenseLines";

export type ExpenseGroup = "CAT" | "PHASE" | "MONTH" | "SUP";
type T = (key: string, values?: Record<string, string | number>) => string;

// The column templates per grouping (board Reports).
export const GRIDS = {
  share: "lg:grid-cols-[minmax(0,1fr)_280px_130px_70px]",
  budget: "lg:grid-cols-[minmax(0,1fr)_240px_120px_120px_76px]",
  supplier: "lg:grid-cols-[minmax(0,1fr)_200px_120px_120px_110px]",
};

const taka = (n: number) => (n ? `৳ ${formatAmount(n)}` : "—");
const share = (n: number, total: number) => (total ? `${((n / total) * 100).toFixed(1)}%` : "");
const fade = (n: number): Line["dim"] => (n ? undefined : "faint");

type Built = { grid: string; heads: { label: string; right?: boolean }[]; lines: Line[]; foot: LineCell[]; total: number; note: string };

// Heads with their share of the total.
const byHead = (r: IExpenseReport, t: T): Built => {
  const rows = headRows(r, t("labour"));
  const total = rows.reduce((n, x) => n + x.amount, 0);
  const max = Math.max(1, ...rows.map((x) => x.amount));
  const used = rows.filter((x) => x.amount > 0).length;
  const topFive = rows.slice(0, 5).reduce((n, x) => n + x.amount, 0);
  return {
    grid: GRIDS.share,
    heads: [{ label: t("cols.head") }, { label: "" }, { label: t("cols.amount"), right: true }, { label: t("cols.share"), right: true }],
    lines: rows.map((x, i) => ({
      key: `c${i}`,
      name: x.name,
      bar: { width: (x.amount / max) * 100, tone: "ok" },
      cells: [
        { text: taka(x.amount), strong: true },
        { text: share(x.amount, total), tone: "muted" },
      ],
      dim: fade(x.amount),
    })),
    foot: [{ text: `৳ ${formatAmount(total)}` }, { text: total ? "100%" : "" }],
    total,
    note: total
      ? t("noteCat", {
          used,
          unused: rows.length > used ? t("noteCatUnused", { count: rows.length - used }) : "",
          percent: formatPercent(Math.round((topFive / total) * 100)),
        })
      : "",
  };
};

// Phases against their budgets: a mark at 100%, yellow past 90%, red past 100%.
const byPhase = (r: IExpenseReport, t: T, withBudget: boolean): Built => {
  const rows = phaseRows(r, t("noPhase"));
  const total = rows.reduce((n, x) => n + x.amount, 0);
  if (!withBudget || !rows.some((x) => x.budget)) {
    const max = Math.max(1, ...rows.map((x) => x.amount));
    return {
      grid: GRIDS.share,
      heads: [{ label: t("cols.phase") }, { label: "" }, { label: t("cols.amount"), right: true }, { label: t("cols.share"), right: true }],
      lines: rows.map((x, i) => ({
        key: `p${i}`,
        name: x.name,
        sub: x.unphased ? t("noPhaseSub") : undefined,
        bar: { width: (x.amount / max) * 100, tone: "ok" },
        cells: [
          { text: taka(x.amount), strong: true },
          { text: share(x.amount, total), tone: "muted" },
        ],
        dim: fade(x.amount),
      })),
      foot: [{ text: `৳ ${formatAmount(total)}` }, { text: total ? "100%" : "" }],
      total,
      note: "",
    };
  }
  const budget = rows.reduce((n, x) => n + (x.budget ?? 0), 0);
  const over = rows.filter((x) => x.budget && x.amount > x.budget);
  return {
    grid: GRIDS.budget,
    heads: [
      { label: t("cols.phase") },
      { label: t("cols.ofBudget") },
      { label: t("cols.spent"), right: true },
      { label: t("cols.budget"), right: true },
      { label: t("cols.used"), right: true },
    ],
    lines: rows.map((x, i) => {
      const use = phaseUse(x);
      const tone = use === null ? "ok" : budgetTone(use);
      return {
        key: `p${i}`,
        name: x.name,
        sub: x.unphased ? t("noPhaseSub") : use !== null && use > 100 ? t("overBudget", { amount: formatAmount(x.amount - (x.budget ?? 0)) }) : undefined,
        subRed: !x.unphased && use !== null && use > 100,
        bar: {
          width: use === null ? 0 : (Math.min(use, BUDGET_SCALE) / BUDGET_SCALE) * 100,
          tone,
          mark: x.budget ? (100 / BUDGET_SCALE) * 100 : undefined,
        },
        cells: [
          { text: taka(x.amount), strong: true },
          { text: taka(x.budget ?? 0), tone: "muted" },
          {
            text: use === null ? "—" : `${use.toFixed(1)}%`,
            strong: true,
            tone: use === null ? "faint" : tone === "over" ? "danger" : tone === "near" ? "gold" : "success",
          },
        ],
        dim: x.amount || x.budget ? (x.amount ? undefined : "soft") : "faint",
      };
    }),
    foot: [
      { text: `৳ ${formatAmount(total)}` },
      { text: `৳ ${formatAmount(budget)}`, tone: "muted" },
      { text: budget ? `${((total / budget) * 100).toFixed(1)}%` : "—" },
    ],
    total,
    note:
      t("notePhase") +
      (over.length
        ? t("notePhaseOver", { names: over.map((x) => x.name).join(", "), amount: formatAmount(over.reduce((n, x) => n + x.amount - (x.budget ?? 0), 0)) })
        : ""),
  };
};

// What each supplier billed, was paid, and is owed in the period.
const bySupplier = (r: IExpenseReport, t: T, wholeProject: boolean, spentTotal: number): Built => {
  const rows = supplierRows(r);
  const total = rows.reduce((n, x) => n + x.billed, 0);
  const paid = rows.reduce((n, x) => n + x.paid, 0);
  const max = Math.max(1, ...rows.map((x) => x.billed));
  return {
    grid: GRIDS.supplier,
    heads: [
      { label: t("cols.supplier") },
      { label: "" },
      { label: t("cols.billed"), right: true },
      { label: t("cols.paid"), right: true },
      { label: t("cols.due"), right: true },
    ],
    lines: rows.map((x, i) => ({
      key: `s${i}`,
      name: x.name,
      bar: { width: (x.billed / max) * 100, tone: "ok" },
      cells: [
        { text: taka(x.billed), strong: true },
        { text: taka(x.paid), tone: "success" },
        { text: x.due > 0 ? taka(x.due) : "—", strong: true, tone: x.due > 0 ? "gold" : "faint" },
      ],
      dim: fade(x.billed),
    })),
    foot: [
      { text: `৳ ${formatAmount(total)}` },
      { text: `৳ ${formatAmount(paid)}`, tone: "success" },
      { text: `৳ ${formatAmount(total - paid)}`, tone: "gold" },
    ],
    total,
    note: wholeProject ? t("noteSupAll", { amount: formatAmount(Math.max(0, spentTotal - total)) }) : t("noteSupMonth"),
  };
};

export const buildLines = (r: IExpenseReport, group: Exclude<ExpenseGroup, "MONTH">, t: T, wholeProject: boolean): Built => {
  if (group === "PHASE") return byPhase(r, t, wholeProject);
  if (group === "SUP")
    return bySupplier(
      r,
      t,
      wholeProject,
      headRows(r, "").reduce((n, x) => n + x.amount, 0),
    );
  return byHead(r, t);
};
