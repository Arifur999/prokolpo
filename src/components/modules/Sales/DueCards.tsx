"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { monthRows, overdueRows } from "@/lib/saleLook";
import { cn } from "@/lib/utils";
import type { ISale } from "@/types/sales.types";

type DueCardsProps = { sales: ISale[]; today: string; projectName: string; canWrite: boolean; onCollect: (sale: ISale) => void };

const day = (iso: string) => dayFirst(iso.slice(0, 10));

// Late installments beside this month's (board SalesList): who to chase, and what falls due.
export function DueCards({ sales, today, projectName, canWrite, onCollect }: DueCardsProps) {
  const t = useTranslations("Sales");
  const locale = useLocale();
  const late = sales.flatMap((s) => (s.standing.late ? [{ sale: s, since: s.standing.late, rows: overdueRows(s, today) }] : []));
  const month = today.slice(0, 7);
  const monthName = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { month: "long", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  const due = monthRows(sales, month);
  const monthTotal = due.reduce((n, d) => n + d.row.amount, 0);
  const monthGot = due.reduce((n, d) => n + d.row.paid, 0);
  const monthDone = due.filter((d) => d.row.paid >= d.row.amount).length;
  const weekday = (iso: string) =>
    new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

  const copyAll = async () => {
    const text = late
      .map(({ sale, rows }) =>
        t("reminder", {
          name: sale.customer,
          project: projectName,
          unit: sale.unitName,
          nos: rows.map((r) => r.no).join(", "),
          amount: formatAmount(rows.reduce((n, r) => n + r.amount - r.paid, 0)),
        }),
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("remindersCopied", { count: late.length }));
    } catch {
      toast.error(t("failed"));
    }
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <section aria-labelledby="od-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-3 px-5 py-3.5">
          <h2 id="od-title" className="m-0 flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-danger-strong" />
            {t("late")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("lateNote")}</span>
        </div>
        <ul className="m-0 list-none p-0">
          {late.map(({ sale, since, rows }) => (
            <li key={sale.id} className="flex items-center gap-3 border-b border-line-3 px-5 py-3">
              <span className="flex min-w-0 grow flex-col">
                <span className="text-[15px] font-semibold">{sale.customer}</span>
                <span className="text-[13px] text-ink-3">
                  {t("lateLine", { unit: sale.unitName, nos: rows.map((r) => r.no).join(", "), count: sale.installments })}
                </span>
                <span className="text-[13px] font-semibold text-danger">{t("lateWhen", { date: day(since.date), days: since.days })}</span>
              </span>
              <span className="text-base font-bold whitespace-nowrap">৳ {formatAmount(sale.standing.lateSum)}</span>
              {canWrite && (
                <button
                  type="button"
                  aria-label={t("takeLate", { name: sale.customer })}
                  onClick={() => onCollect(sale)}
                  className="h-9 cursor-pointer rounded-[9px] border border-brand bg-white px-3 text-sm font-semibold whitespace-nowrap text-brand"
                >
                  {t("take")}
                </button>
              )}
            </li>
          ))}
        </ul>
        {late.length === 0 && (
          <p className="m-0 flex items-center gap-2 p-5 text-sm text-success">
            <Icon name="checkCircle" size={18} strokeWidth={2} />
            {t("noLate")}
          </p>
        )}
        <button
          type="button"
          disabled={!late.length}
          onClick={() => void copyAll()}
          className="flex h-11 cursor-pointer items-center justify-center gap-2 border-none bg-surface-3 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="copy" size={16} strokeWidth={2} />
          {t("copyReminders")}
        </button>
      </section>

      <section aria-labelledby="mo-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-3 px-5 py-3.5">
          <h2 id="mo-title" className="m-0 text-base font-semibold">
            {t("monthTitle", { month: monthName })}
          </h2>
          <span className="text-[13px] text-ink-2">{t("monthSub", { amount: formatAmount(monthTotal), count: due.length, done: monthDone })}</span>
        </div>
        <div
          role="img"
          aria-label={t("monthAria", { month: monthName, percent: `${monthTotal ? Math.round((monthGot / monthTotal) * 100) : 0}%` })}
          className="h-1 bg-line-3"
        >
          <span className="block h-full bg-brand-mid" style={{ width: `${monthTotal ? ((monthGot / monthTotal) * 100).toFixed(1) : 0}%` }} />
        </div>
        <ul className="m-0 list-none p-0">
          {due.map(({ sale, row }) => {
            const done = row.paid >= row.amount;
            const isLate = !done && row.due.slice(0, 10) < today;
            return (
              <li
                key={`${sale.id}-${row.no}`}
                className="grid grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line-3 px-5 py-2 sm:grid-cols-[62px_minmax(0,1fr)_100px_96px]"
              >
                <span
                  className={cn(
                    "flex flex-col items-center rounded-[9px] py-0.75",
                    done ? "bg-brand-tint text-success" : isLate ? "bg-danger-tint text-danger" : "bg-surface-2 text-ink",
                  )}
                >
                  <span className="text-[17px] leading-[1.2] font-bold">{row.due.slice(8, 10)}</span>
                  <span className="text-[11px] font-semibold">{weekday(row.due)}</span>
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{sale.customer}</span>
                  <span className="text-[13px] text-ink-3">{t("monthLine", { unit: sale.unitName, no: row.no, count: sale.installments })}</span>
                </span>
                <span className="text-right text-[15px] font-bold">৳ {formatAmount(row.amount)}</span>
                <span className="flex justify-end">
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-success">
                      <Icon name="check" size={14} strokeWidth={2.4} />
                      {t("paidDone")}
                    </span>
                  ) : (
                    canWrite && (
                      <button
                        type="button"
                        aria-label={t("takeFor", { name: sale.customer })}
                        onClick={() => onCollect(sale)}
                        className="h-8.5 cursor-pointer rounded-[9px] border border-line bg-white px-3 text-[13px] font-semibold whitespace-nowrap text-ink"
                      >
                        {t("take")}
                      </button>
                    )
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        {due.length === 0 && <p className="m-0 p-5 text-sm text-ink-3">{t("monthEmpty")}</p>}
      </section>
    </div>
  );
}
