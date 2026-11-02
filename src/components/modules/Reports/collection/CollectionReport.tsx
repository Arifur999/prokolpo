"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatAmount, formatPercent } from "@/lib/money";
import { monthName } from "@/lib/months";
import type { collectionReport } from "@/lib/reportCollection";
import { cn } from "@/lib/utils";

type Report = ReturnType<typeof collectionReport>;

const card = "flex flex-col gap-1 rounded-2xl border px-4.5 py-4";
const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_96px_96px_96px_120px] lg:items-center lg:gap-x-2.5";
const AGES = [
  { key: "A", bar: "bg-gold-strong" },
  { key: "B", bar: "bg-danger-strong" },
  { key: "C", bar: "bg-danger" },
] as const;

// The installment report (board ReportCollection): what was due and paid, month by month,
// customer by customer, and how long late money has waited.
export function CollectionReport({ report: c }: { report: Report }) {
  const t = useTranslations("Reports.collection");
  const tr = useTranslations("Reports");
  const locale = useLocale() as "bn" | "en";
  const name = (month: string, style: "long" | "short" = "short") => monthName(new Date(`${month}-15`), locale, style);
  const lakh = (n: number) => tr("lakh", { n: (n / 100_000).toFixed(n >= 1_000_000 ? 1 : 2).replace(/\.?0+$/, "") });
  // Headroom above the tallest bar for its label.
  const top = Math.max(1, ...c.months.map((m) => m.due)) * 1.15;
  const agingMax = Math.max(1, ...c.aging);
  const range = `${name(c.months[0]?.month ?? "", "long")} – ${name(c.months.at(-1)?.month ?? "", "long")}`;

  if (!c.customers.length) return <p className="m-0 rounded-2xl border border-line-2 bg-white px-5 py-8 text-center text-[15px] text-ink-3">{t("empty")}</p>;

  return (
    <>
      <section aria-label={t("cardsLabel")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-[13px] font-semibold text-ink-2">{t("dueToDate")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(c.dueToDate)}</p>
          <p className="m-0 text-xs text-ink-3">{t("dueToDateSub")}</p>
        </article>
        <article className={cn(card, "border-brand-edge bg-brand-wash")}>
          <h2 className="m-0 text-[13px] font-semibold text-success">{t("paid")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(c.paidToDate)}</p>
          <p className="m-0 text-xs text-ink-3">{t("paidSub", { percent: formatPercent(c.rate) })}</p>
        </article>
        <article className={cn(card, "border-danger-line bg-danger-tint")}>
          <h2 className="m-0 text-[13px] font-semibold text-danger">{t("late")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(c.lateSum)}</p>
          <p className="m-0 text-xs text-ink-3">{t("lateSub", { count: c.lateCount, people: c.latePeople })}</p>
        </article>
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-[13px] font-semibold text-ink-2">{t("next")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(c.nextThree)}</p>
          <p className="m-0 text-xs text-ink-3">{`${name(c.nextFrom, "long")} – ${name(c.nextTo, "long")}`}</p>
        </article>
      </section>
      <section aria-labelledby="cm-title" className="flex flex-col gap-2.5 rounded-2xl border border-line-2 bg-white px-5 pt-4 pb-4.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 id="cm-title" className="m-0 text-[17px] font-semibold">
              {t("chartTitle")}
            </h2>
            <span className="text-[13px] text-ink-3">{t("chartSub")}</span>
          </div>
          <span className="flex items-center gap-3.5 text-[13px] text-ink-2">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-3 rounded-xs bg-line-2 shadow-[inset_0_0_0_1px_var(--color-axis)]" />
              {t("legendDue")}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-3 rounded-xs bg-brand-mid" />
              {t("legendPaid")}
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-3 rounded-xs bg-danger-strong" />
              {t("legendLate")}
            </span>
          </span>
        </div>
        <div role="img" aria-label={t("chartAria", { range })} className="flex flex-col gap-1.5">
          <div className="flex h-50 items-end gap-1.5 border-b border-axis sm:gap-3.5">
            {c.months.map((m) => (
              <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className={cn("text-[11px] font-bold whitespace-nowrap", m.late ? "text-danger" : "text-ink")}>{m.due ? lakh(m.due) : ""}</span>
                <div
                  title={
                    t("barTitle", { month: name(m.month, "long"), due: formatAmount(m.due) }) +
                    (m.ahead ? t("barAhead") : t("barPaid", { amount: formatAmount(m.paid) })) +
                    (m.late ? t("barLate", { amount: formatAmount(m.late) }) : "")
                  }
                  className="flex w-full max-w-11.5 flex-col justify-end overflow-hidden rounded-t bg-line-2 shadow-[inset_0_0_0_1px_var(--color-axis)]"
                  style={{ height: `${((m.due / top) * 100).toFixed(1)}%` }}
                >
                  <span className="block bg-danger-strong" style={{ height: m.due ? `${((m.late / m.due) * 100).toFixed(1)}%` : 0 }} />
                  <span className="block bg-brand-mid" style={{ height: m.due ? `${((Math.min(m.paid, m.due) / m.due) * 100).toFixed(1)}%` : 0 }} />
                </div>
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="flex gap-1.5 text-xs text-ink-2 sm:gap-3.5">
            {c.months.map((m, i) => (
              <span key={m.month} className={cn("flex-1 text-center", i === c.months.findIndex((x) => x.ahead) && "font-bold")}>
                {name(m.month)}
              </span>
            ))}
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 items-start gap-4.5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-labelledby="cc-title" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
          <div className="border-b border-line-2 px-4.5 py-3.5">
            <h2 id="cc-title" className="m-0 text-base font-semibold">
              {t("byCustomer")}
            </h2>
          </div>
          <div role="table" aria-labelledby="cc-title">
            <div role="row" className={cn("hidden h-9.5 border-b border-line-2 bg-surface-2 px-4.5 text-xs font-semibold text-ink-2", GRID)}>
              <span role="columnheader">{t("cols.customer")}</span>
              <span role="columnheader" className="text-right">
                {t("cols.due")}
              </span>
              <span role="columnheader" className="text-right">
                {t("cols.paid")}
              </span>
              <span role="columnheader" className="text-right">
                {t("cols.late")}
              </span>
              <span role="columnheader">{t("cols.onTime")}</span>
            </div>
            {c.customers.map((r) => {
              const percent = r.full ? (r.onTime / r.full) * 100 : 0;
              return (
                <div key={r.id} role="row" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 px-4.5 py-2", GRID)}>
                  <span role="cell" className="flex w-full min-w-0 flex-col lg:w-auto">
                    <span className="truncate text-sm font-semibold">{r.name}</span>
                    <span className="truncate text-xs text-ink-3">{t("unitLine", { unit: r.unit, paid: r.full, count: r.count })}</span>
                  </span>
                  <span role="cell" className="text-right text-sm">
                    {formatAmount(r.due)}
                  </span>
                  <span role="cell" className="text-right text-sm text-success">
                    {formatAmount(r.paid)}
                  </span>
                  <span role="cell" className={cn("text-right text-sm font-bold", r.late ? "text-danger" : "text-ink-5")}>
                    {r.late ? formatAmount(r.late) : "—"}
                  </span>
                  <span role="cell" className="flex grow items-center gap-1.5 text-[13px] lg:grow-0">
                    <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
                      <span className={cn("block h-full", percent >= 80 ? "bg-brand-mid" : "bg-gold-strong")} style={{ width: `${percent.toFixed(0)}%` }} />
                    </span>
                    {r.full ? `${r.onTime}/${r.full}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section aria-labelledby="ag-title" className="flex flex-col gap-2.5 rounded-2xl border border-line-2 bg-white px-4.5 py-4">
          <h2 id="ag-title" className="m-0 text-base font-semibold">
            {t("aging")}
          </h2>
          {AGES.map((a, i) => {
            const amount = c.aging[i] ?? 0;
            return (
              <div key={a.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span>{t(`ages.${a.key}.label`)}</span>
                  <strong className={cn("font-bold", amount ? "text-danger" : "text-ink-5")}>{amount ? `৳ ${formatAmount(amount)}` : "—"}</strong>
                </div>
                <span className="h-1.5 overflow-hidden rounded-full bg-line-3">
                  <span className={cn("block h-full", a.bar)} style={{ width: `${((amount / agingMax) * 100).toFixed(1)}%` }} />
                </span>
                <span className="text-xs text-ink-3">{amount ? t(`ages.${a.key}.sub`) : t("nothing")}</span>
              </div>
            );
          })}
          <p className="m-0 border-t border-line-3 pt-2 text-xs leading-[1.55] text-ink-3">{t("agingNote")}</p>
        </section>
      </div>
    </>
  );
}
