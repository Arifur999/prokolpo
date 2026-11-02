"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { saleState, type SaleState } from "@/lib/saleLook";
import { floorShort } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { ISale } from "@/types/sales.types";

const GRID = "lg:grid lg:grid-cols-[128px_minmax(0,1fr)_96px_112px_150px_112px_168px_124px] lg:items-center lg:gap-x-2.5";
const FILTERS = ["ALL", "RUNNING", "LATE", "PAID"] as const;
const squash = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();

type SalesTableProps = { projectId: string; sales: ISale[]; canWrite: boolean; onCollect: (sale: ISale) => void };

// "সব বিক্রি" (board SalesList): every sale with price, what came in, what is left, and its
// installments, filtered by state or searched.
export function SalesTable({ projectId, sales, canWrite, onCollect }: SalesTableProps) {
  const t = useTranslations("Sales");
  const locale = useLocale() as "bn" | "en";
  const [filter, setFilter] = useState<SaleState | "ALL">("ALL");
  const [q, setQ] = useState("");
  const counts = { ALL: sales.length, RUNNING: 0, LATE: 0, PAID: 0 };
  for (const s of sales) counts[saleState(s)]++;
  const shown = sales.filter(
    (s) => (filter === "ALL" || saleState(s) === filter) && (!q || [s.unitName, s.customer, s.phone].some((v) => squash(v).includes(squash(q)))),
  );
  const sum = (pick: (s: ISale) => number) => shown.reduce((n, s) => n + pick(s), 0);

  return (
    <section aria-labelledby="sl-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center gap-4 border-b border-line-2 px-5 py-3">
        <h2 id="sl-title" className="m-0 text-[17px] font-semibold">
          {t("allTitle")}
        </h2>
        <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-8.5 cursor-pointer rounded-full px-3 text-sm text-ink",
                  on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
                )}
              >
                {t(`filter.${f}`)} <span className="text-ink-3">{counts[f]}</span>
              </button>
            );
          })}
        </div>
        <label className="relative ml-auto flex items-center">
          <span className="sr-only">{t("search")}</span>
          <Icon name="search" size={18} strokeWidth={2} className="pointer-events-none absolute left-3 text-ink-3" />
          <input
            type="search"
            placeholder={t("search")}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="h-10 w-60 rounded-[10px] border border-line bg-white pr-3 pl-9.5 text-[15px] text-ink outline-none"
          />
        </label>
      </div>
      <div role="table" aria-labelledby="sl-title">
        <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}>
          <span role="columnheader">{t("colUnit")}</span>
          <span role="columnheader">{t("colBuyer")}</span>
          <span role="columnheader">{t("colDate")}</span>
          <span role="columnheader" className="text-right">
            {t("colPrice")}
          </span>
          <span role="columnheader">{t("colReceived")}</span>
          <span role="columnheader" className="text-right">
            {t("colDue")}
          </span>
          <span role="columnheader">{t("colPlan")}</span>
          <span role="columnheader">
            <span className="sr-only">{t("colActions")}</span>
          </span>
        </div>
        {shown.map((s) => {
          const st = s.standing;
          const percent = Math.min(100, (st.received / s.price) * 100);
          const state = saleState(s);
          const href = projectHref(projectId, `sales/${s.id}`);
          return (
            <div
              key={s.id}
              role="row"
              className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line-3 px-5 py-3 lg:min-h-16 lg:py-0", GRID)}
            >
              <span role="cell" className="flex flex-col">
                <Link href={href} className="text-[15px] font-bold text-ink no-underline hover:text-brand">
                  {s.unitName}
                </Link>
                <span className="text-xs text-ink-3">
                  {[t("unitFloor", { floor: floorShort(locale, s.floor) }), s.size ? `${s.size} sqft` : null].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span role="cell" className="flex min-w-0 grow flex-col">
                <span className="truncate text-[15px] font-medium">{s.customer}</span>
                <span className="text-xs text-ink-3">{displayPhone(s.phone)}</span>
              </span>
              <span role="cell" className="text-sm text-ink-2">
                {dayFirst(s.date.slice(0, 10))}
              </span>
              <span role="cell" className="text-right text-[15px]">
                {formatAmount(s.price)}
              </span>
              <span role="cell" className="flex min-w-36 flex-col gap-0.75">
                <span className="flex justify-between text-[13px]">
                  <span>{formatAmount(st.received)}</span>
                  <span className="text-ink-3">{Math.round(percent)}%</span>
                </span>
                <span className="h-1.25 overflow-hidden rounded-full bg-line-3">
                  <span className="block h-full bg-brand-mid" style={{ width: `${percent.toFixed(1)}%` }} />
                </span>
              </span>
              <span role="cell" className={cn("text-right text-[15px] font-bold", st.due > 0 ? "text-gold-ink" : "text-success")}>
                {st.due > 0 ? formatAmount(st.due) : "—"}
              </span>
              <span role="cell" className="flex flex-col">
                <span className="text-[13px] text-ink-2">{s.installments ? t("planOf", { count: s.installments, paid: st.paidCount }) : t("planFull")}</span>
                <span className={cn("text-[13px] font-semibold", state === "LATE" ? "text-danger" : state === "PAID" ? "text-success" : "text-ink-2")}>
                  {state === "LATE"
                    ? t("stateLate", { amount: formatAmount(st.lateSum) })
                    : state === "PAID"
                      ? s.installments
                        ? t("stateAll")
                        : t("statePaid")
                      : st.next
                        ? t("stateNext", { date: dayFirst(st.next.date.slice(0, 10)) })
                        : ""}
                </span>
              </span>
              <span role="cell" className="ml-auto flex items-center justify-end gap-1.5">
                {canWrite && st.due > 0 && (
                  <button
                    type="button"
                    aria-label={t("takeFor", { name: s.customer })}
                    onClick={() => onCollect(s)}
                    className="h-8.5 cursor-pointer rounded-[9px] border border-brand bg-white px-2.5 text-[13px] font-semibold whitespace-nowrap text-brand"
                  >
                    {t("take")}
                  </button>
                )}
                <Link
                  href={href}
                  aria-label={t("detailLabel", { unit: s.unitName })}
                  className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
                >
                  <Icon name="chevronRight" size={16} strokeWidth={2} />
                </Link>
              </span>
            </div>
          );
        })}
        {shown.length === 0 && <p className="m-0 px-5 py-7 text-center text-[15px] text-ink-3">{sales.length ? t("none") : t("empty")}</p>}
        <div role="row" className={cn("flex flex-wrap gap-x-4 bg-surface-2 px-5 py-3 text-sm font-bold", GRID)}>
          <span role="cell">{t("total")}</span>
          <span role="cell" className="font-medium text-ink-2">
            {t("shown", { count: shown.length })}
          </span>
          <span role="cell" />
          <span role="cell" className="text-right">
            {formatAmount(sum((s) => s.price))}
          </span>
          <span role="cell" className="text-success">
            {formatAmount(sum((s) => s.standing.received))}
          </span>
          <span role="cell" className="text-right text-gold-ink">
            {formatAmount(sum((s) => Math.max(0, s.standing.due)))}
          </span>
          <span role="cell" />
          <span role="cell" />
        </div>
      </div>
    </section>
  );
}
