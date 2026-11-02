import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import type { shopFigures } from "@/lib/shopLook";

type DailyChartProps = { figures: ReturnType<typeof shopFigures>; monthName: string };

// Round the scale up to a whole 10k so the three grid lines read 10k, 20k, 30k (board BizSales).
const scaleFor = (max: number) => Math.max(30_000, Math.ceil(max / 30_000) * 30_000);
const short = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

// "প্রতিদিনের বিক্রি" (board BizSales): last month's sales a bar a day, Fridays lighter, the
// best day ringed and the daily average dashed across.
export function DailyChart({ figures: f, monthName }: DailyChartProps) {
  const t = useTranslations("Shop.chart");
  const scale = scaleFor(f.best.amount);
  const days = f.bars.length;
  const average = Math.round(f.lastAverage);
  const best = f.best.amount ? dayFirst(f.best.date).slice(0, 5) : "—";
  const avgPos = `${((f.lastAverage / scale) * 100).toFixed(1)}%`;

  return (
    <section aria-labelledby="ch-title" className="flex flex-col gap-3 rounded-2xl border border-line-2 bg-white px-5 pt-4 pb-4.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 id="ch-title" className="m-0 text-[17px] font-semibold">
            {t("title", { month: monthName })}
          </h2>
          <span className="text-[13px] text-ink-3">{t("sub", { total: formatAmount(f.lastTotal), days, best, amount: formatAmount(f.best.amount) })}</span>
        </div>
        <span className="flex flex-wrap items-center gap-4 text-[13px] text-ink-2">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-3 rounded-xs bg-brand-mid" />
            {t("sale")}
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-3 rounded-xs bg-brand-soft" />
            {t("friday")}
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-gold-strong" />
            {t("average")}
          </span>
        </span>
      </div>
      <div
        role="img"
        aria-label={t("aria", { month: monthName, days, average: formatAmount(average), best, amount: formatAmount(f.best.amount) })}
        className="grid grid-cols-[52px_minmax(0,1fr)] gap-2"
      >
        <div aria-hidden="true" className="relative h-47.5 text-xs text-ink-3">
          <span className="absolute -top-2 right-0">৳ {short(scale)}</span>
          <span className="absolute top-[calc(33.3%-8px)] right-0">৳ {short((scale * 2) / 3)}</span>
          <span className="absolute top-[calc(66.6%-8px)] right-0">৳ {short(scale / 3)}</span>
          <span className="absolute right-0 -bottom-2">0</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="relative h-47.5 border-b border-axis">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-line-3" />
            <span aria-hidden="true" className="absolute inset-x-0 top-[33.3%] border-t border-line-3" />
            <span aria-hidden="true" className="absolute inset-x-0 top-[66.6%] border-t border-line-3" />
            <div className="absolute inset-0 flex items-end gap-0.5 px-0.5 sm:gap-1">
              {f.bars.map((b) => {
                const friday = new Date(b.date).getUTCDay() === 5;
                return (
                  <span
                    key={b.date}
                    title={t("bar", { date: dayFirst(b.date).slice(0, 5), amount: formatAmount(b.amount) })}
                    className={`flex-1 rounded-t-[3px] ${friday ? "bg-brand-soft" : "bg-brand-mid"} ${b.date === f.best.date && b.amount ? "shadow-[inset_0_0_0_1.5px_var(--color-brand-deep)]" : ""}`}
                    style={{ height: `${((b.amount / scale) * 100).toFixed(1)}%` }}
                  />
                );
              })}
            </div>
            {average > 0 && (
              <>
                <span aria-hidden="true" className="absolute inset-x-0 border-t-2 border-dashed border-gold-strong" style={{ bottom: avgPos }} />
                <span
                  aria-hidden="true"
                  className="absolute right-1 -translate-y-0.5 rounded-md bg-white px-1.5 text-xs font-bold text-gold-ink"
                  style={{ bottom: avgPos }}
                >
                  {t("averageLabel", { amount: formatAmount(average) })}
                </span>
              </>
            )}
          </div>
          <div aria-hidden="true" className="flex gap-0.5 px-0.5 text-[11px] text-ink-3 sm:gap-1">
            {f.bars.map((b, i) => {
              const day = i + 1;
              return (
                <span key={b.date} className={`flex-1 text-center ${b.date === f.best.date && b.amount ? "font-bold" : ""}`}>
                  {day === 1 || day % 5 === 0 ? day : ""}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
