"use client";

import { useLocale, useTranslations } from "next-intl";
import { Segmented } from "@/components/shared/Segmented";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { monthName } from "@/lib/months";
import { monthStats } from "@/lib/reportExpense";
import { cn } from "@/lib/utils";
import type { IExpenseReport } from "@/types/books.types";
import { buildLines, type ExpenseGroup } from "./buildExpenseLines";
import { ExpenseLines } from "./ExpenseLines";
import { ExpenseMonthChart } from "./ExpenseMonthChart";

export type ExpensePeriod = "ALL" | "LAST";

type ExpenseReportProps = {
  report: IExpenseReport;
  group: ExpenseGroup;
  period: ExpensePeriod;
  lastMonth: string;
  onChange: (patch: { group?: ExpenseGroup; period?: ExpensePeriod }) => void;
};

const GROUPS: ExpenseGroup[] = ["CAT", "PHASE", "MONTH", "SUP"];

// The spending report (board Reports): one period grouped by head, phase, month or supplier.
export function ExpenseReport({ report, group, period, lastMonth, onChange }: ExpenseReportProps) {
  const t = useTranslations("Reports.expense");
  const tr = useTranslations("Reports");
  const locale = useLocale() as "bn" | "en";
  const translate = (key: string, values?: Record<string, string | number>) => t(key as Parameters<typeof t>[0], values);
  const monthView = group === "MONTH";
  const name = (month: string) => monthName(new Date(`${month}-15`), locale, locale === "bn" ? "long" : "short");
  const lakh = (n: number) => tr("lakh", { n: (n / 100_000).toFixed(n >= 1_000_000 ? 1 : 2).replace(/\.?0+$/, "") });
  const built = monthView ? null : buildLines(report, group, translate, period === "ALL");
  const stats = monthStats(report.months);
  const total = built ? built.total : stats.total;
  const left = (report.budget ?? 0) - stats.total;
  const monthNote = stats.total
    ? t("noteMonth", { month: name(stats.top.month), average: formatAmount(Math.round(stats.average)) }) +
      (report.budget && left > 0 && stats.average ? t("noteMonthLeft", { left: formatAmount(left), months: Math.ceil(left / stats.average) }) : "")
    : "";
  const note = built ? built.note : monthNote;
  const range = t(period === "ALL" ? "rangeAll" : "range", { from: dayFirst(report.from), to: dayFirst(report.to) });
  const periods: { value: ExpensePeriod; label: string }[] = [
    { value: "ALL", label: t("all") },
    { value: "LAST", label: t("monthYear", { month: monthName(new Date(`${lastMonth}-15`), locale, "long"), year: lastMonth.slice(0, 4) }) },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Segmented
          label={t("groupLabel")}
          size="lg"
          value={group}
          options={GROUPS.map((g) => ({ value: g, label: t(`groups.${g}`) }))}
          onChange={(g) => onChange({ group: g, period: g === "MONTH" ? "ALL" : period })}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-2">{t("period")}</span>
          <div role="group" aria-label={t("periodLabel")} className="flex gap-1.5">
            {periods.map((p) => {
              const on = (monthView ? "ALL" : period) === p.value;
              const off = monthView && p.value !== "ALL";
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={on}
                  disabled={off}
                  onClick={() => onChange({ period: p.value })}
                  className={cn(
                    "h-9 rounded-full px-3 text-sm",
                    on ? "border-[1.5px] border-brand bg-brand-wash font-semibold text-ink" : "border border-line bg-white font-medium",
                    off ? "cursor-not-allowed text-ink-5" : "cursor-pointer text-ink",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <section aria-labelledby="ex-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-2 px-5 py-4">
          <div className="flex flex-col">
            <h2 id="ex-title" className="m-0 text-lg font-semibold">
              {t(`titles.${group}`)}
            </h2>
            <span className="text-[13px] text-ink-3">{range}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[13px] text-ink-2">{group === "SUP" ? t("totalBills") : t("total")}</span>
            <strong className="text-2xl leading-[1.2] font-bold">৳ {formatAmount(total)}</strong>
          </div>
        </div>
        {monthView ? (
          <ExpenseMonthChart
            months={report.months}
            name={name}
            lakh={lakh}
            aria={t("monthAria", { range, month: name(stats.top.month), amount: formatAmount(stats.top.amount) })}
          />
        ) : (
          built && (
            <ExpenseLines labelledBy="ex-title" grid={built.grid} heads={built.heads} lines={built.lines} foot={{ label: t("sum"), cells: built.foot }} />
          )
        )}
        {note && <p className="m-0 border-t border-line-3 px-5 py-3 text-[13px] leading-[1.55] text-ink-2">{note}</p>}
      </section>
    </>
  );
}
