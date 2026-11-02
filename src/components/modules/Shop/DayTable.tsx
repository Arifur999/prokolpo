import { useLocale, useTranslations } from "next-intl";
import { weekdayName } from "@/lib/dhakaTime";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { daySales } from "@/lib/shopLook";
import { cn } from "@/lib/utils";
import type { IShopDay } from "@/types/shop.types";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_88px_80px_88px_104px_92px_76px] lg:items-center lg:gap-x-2";
const SHOWN = 10;
const dash = (n: number) => (n ? formatAmount(n) : "—");

type DayTableProps = { days: IShopDay[]; highlight: string | null; canWrite: boolean; onEdit: (day: IShopDay) => void };

// "প্রতিদিনের হিসাব" (board BizSales): the last ten days, newest first, with their totals.
export function DayTable({ days, highlight, canWrite, onEdit }: DayTableProps) {
  const t = useTranslations("Shop.days");
  const locale = useLocale() as "bn" | "en";
  const shown = days.slice(0, SHOWN);
  const sum = (pick: (d: IShopDay) => number) => formatAmount(shown.reduce((n, d) => n + pick(d), 0));

  return (
    <section aria-labelledby="dt-title" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line-2 px-4.5 py-3.5">
        <h2 id="dt-title" className="m-0 text-[17px] font-semibold">
          {t("title")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("note")}</span>
      </div>
      <div role="table" aria-labelledby="dt-title">
        <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-4.5 text-[13px] font-semibold text-ink-2", GRID)}>
          <span role="columnheader">{t("day")}</span>
          {(["cash", "mobile", "credit", "total", "collect", "other"] as const).map((k) => (
            <span key={k} role="columnheader" className="text-right">
              {t(k)}
            </span>
          ))}
        </div>
        {shown.map((d) => {
          const label = `${dayFirst(d.date).slice(0, 5)} · ${weekdayName(new Date(d.date), locale)}`;
          return (
            <div
              key={d.id}
              role="row"
              className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 px-4.5 py-2", d.id === highlight && "bg-brand-wash", GRID)}
            >
              <span role="cell" className="flex w-full min-w-0 flex-col lg:w-auto">
                {canWrite ? (
                  <button
                    type="button"
                    aria-label={t("edit", { date: dayFirst(d.date) })}
                    onClick={() => onEdit(d)}
                    className="cursor-pointer border-none bg-transparent p-0 text-left text-sm font-semibold text-ink hover:text-brand"
                  >
                    {label}
                  </button>
                ) : (
                  <span className="text-sm font-semibold">{label}</span>
                )}
                <span className="truncate text-xs text-ink-3">{[d.note, t("by", { name: d.by })].filter(Boolean).join(" · ")}</span>
              </span>
              <span role="cell" className="text-right text-sm">
                {formatAmount(d.cash)}
              </span>
              <span role="cell" className="text-right text-sm">
                {formatAmount(d.mobile)}
              </span>
              <span role="cell" className="text-right text-sm text-gold-ink">
                {dash(d.credit)}
              </span>
              <span role="cell" className="ml-auto text-right text-[15px] font-bold lg:ml-0">
                {formatAmount(daySales(d))}
              </span>
              <span role="cell" className="text-right text-sm text-success">
                {dash(d.collect)}
              </span>
              <span role="cell" className="text-right text-sm text-ink-2">
                {dash(d.other)}
              </span>
            </div>
          );
        })}
        {days.length === 0 && <p className="m-0 border-b border-line-3 px-5 py-6 text-center text-[15px] text-ink-3">{t("empty")}</p>}
        <div role="row" className={cn("flex flex-wrap gap-x-3 bg-surface-2 px-4.5 py-2.75 text-sm font-bold", GRID)}>
          <span role="cell">{t("sum", { count: shown.length })}</span>
          <span role="cell" className="text-right">
            {sum((d) => d.cash)}
          </span>
          <span role="cell" className="text-right">
            {sum((d) => d.mobile)}
          </span>
          <span role="cell" className="text-right text-gold-ink">
            {sum((d) => d.credit)}
          </span>
          <span role="cell" className="text-right">
            {sum(daySales)}
          </span>
          <span role="cell" className="text-right text-success">
            {sum((d) => d.collect)}
          </span>
          <span role="cell" className="text-right">
            {sum((d) => d.other)}
          </span>
        </div>
      </div>
    </section>
  );
}
