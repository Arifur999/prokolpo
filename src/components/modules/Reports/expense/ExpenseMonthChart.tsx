import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import { monthStats, niceTop } from "@/lib/reportExpense";
import type { IExpenseReport } from "@/types/books.types";

type ExpenseMonthChartProps = { months: IExpenseReport["months"]; name: (month: string) => string; lakh: (amount: number) => string; aria: string };

// "মাস অনুযায়ী খরচ" (board Reports): a bar a month, the busiest darker, the average dashed.
export function ExpenseMonthChart({ months, name, lakh, aria }: ExpenseMonthChartProps) {
  const t = useTranslations("Reports.expense");
  const stats = monthStats(months);
  const top = niceTop(stats.top.amount);
  const avgPos = `${((stats.average / top) * 100).toFixed(1)}%`;

  return (
    <div role="img" aria-label={aria} className="flex flex-col gap-1.5 px-5 pt-5 pb-4">
      <div className="relative h-57.5 border-b border-axis">
        {[0, 1, 2].map((i) => (
          <span key={i} aria-hidden="true">
            <span className="absolute inset-x-0 border-t border-line-3" style={{ top: `${(i * 100) / 3}%` }} />
            <span className="absolute left-0 -translate-y-2.25 bg-white pr-1 text-[11px] text-ink-3" style={{ top: `${(i * 100) / 3}%` }}>
              {lakh((top * (3 - i)) / 3)}
            </span>
          </span>
        ))}
        <div className="absolute inset-y-0 right-0 left-13 flex items-end gap-2 sm:gap-4.5">
          {months.map((m) => (
            <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-bold whitespace-nowrap text-ink">{m.amount ? lakh(m.amount) : ""}</span>
              <span
                title={t("barTitle", { month: name(m.month), amount: formatAmount(m.amount) })}
                className={`w-full max-w-13.5 rounded-t ${m.month === stats.top.month ? "bg-brand" : "bg-brand-mid"}`}
                style={{ height: `${((m.amount / top) * 100).toFixed(1)}%` }}
              />
            </div>
          ))}
        </div>
        {stats.average > 0 && (
          <span aria-hidden="true" className="absolute right-0 left-13 border-t-2 border-dashed border-gold-strong" style={{ bottom: avgPos }} />
        )}
      </div>
      <div aria-hidden="true" className="flex gap-2 pl-13 text-xs text-ink-2 sm:gap-4.5">
        {months.map((m) => (
          <span key={m.month} className="flex-1 text-center">
            {name(m.month)}
          </span>
        ))}
      </div>
      <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
        <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-gold-strong" />
        {t("averageLabel", { amount: formatAmount(Math.round(stats.average)) })}
      </span>
    </div>
  );
}
