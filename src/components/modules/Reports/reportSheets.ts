import type { Translate } from "@/lib/activityText";
import type { Sheet } from "@/lib/excel";
import type { collectionReport } from "@/lib/reportCollection";
import type { duesReport } from "@/lib/reportDues";
import { headRows, phaseRows, supplierRows } from "@/lib/reportExpense";
import type { profitReport } from "@/lib/reportProfit";
import type { IExpenseReport } from "@/types/books.types";
import type { ExpenseGroup } from "./expense/buildExpenseLines";

// Each report as Excel sheets, in the reader's language (t is the "Reports" namespace).

export const expenseSheet = (r: IExpenseReport, group: ExpenseGroup, t: Translate): Sheet => {
  const name = t(`expense.titles.${group}`);
  if (group === "MONTH")
    return { name, header: [t("expense.groups.MONTH"), t("expense.cols.amount")], widths: [12, 16], rows: r.months.map((m) => [m.month, m.amount]) };
  if (group === "PHASE") {
    return {
      name,
      header: [t("expense.cols.phase"), t("expense.cols.spent"), t("expense.cols.budget")],
      widths: [28, 16, 16],
      rows: phaseRows(r, t("expense.noPhase")).map((p) => [p.name, p.amount, p.budget]),
    };
  }
  if (group === "SUP") {
    return {
      name,
      header: [t("expense.cols.supplier"), t("expense.cols.billed"), t("expense.cols.paid"), t("expense.cols.due")],
      widths: [28, 16, 16, 16],
      rows: supplierRows(r).map((s) => [s.name, s.billed, s.paid, s.due]),
    };
  }
  return {
    name,
    header: [t("expense.cols.head"), t("expense.cols.amount")],
    widths: [28, 16],
    rows: headRows(r, t("expense.labour")).map((h) => [h.name, h.amount]),
  };
};

export const collectionSheet = (c: ReturnType<typeof collectionReport>, t: Translate): Sheet => ({
  name: t("kinds.COLLECTION.label"),
  header: [t("collection.cols.customer"), t("expense.cols.head"), t("collection.cols.due"), t("collection.cols.paid"), t("collection.cols.late")],
  widths: [24, 16, 14, 14, 14],
  rows: c.customers.map((r) => [r.name, r.unit, r.due, r.paid, r.late]),
});

export const profitSheet = (p: ReturnType<typeof profitReport>, t: Translate): Sheet[] => [
  {
    name: t("profit.title"),
    header: ["", t("expense.cols.amount")],
    widths: [36, 16],
    rows: [
      [t("profit.sold", { count: p.soldCount }), p.sold],
      [p.onBudget ? t("profit.costBudget") : t("profit.costNow"), p.cost],
      [p.onBudget ? t("profit.profitBudget") : t("profit.profitNow"), p.profit],
    ],
  },
  ...(p.shares.length
    ? [
        {
          name: t("profit.shares"),
          header: [
            t("profit.cols.partner"),
            t("profit.cols.share"),
            t("profit.cols.capital"),
            t("profit.cols.part"),
            t("profit.cols.due"),
            t("profit.cols.net"),
          ],
          widths: [24, 10, 16, 16, 16, 16],
          rows: p.shares.map((s) => [s.name, s.share, s.capital, s.part, s.owed, s.net]),
        },
      ]
    : []),
];

export const duesSheet = (d: ReturnType<typeof duesReport>, t: Translate): Sheet => ({
  name: t("kinds.DUES.label"),
  header: ["", t("collection.cols.customer"), t("expense.cols.amount")],
  widths: [18, 28, 16],
  rows: d.groups.flatMap((g) => g.items.map((i) => [t(`dues.${g.key}`), i.name, i.amount])),
});
