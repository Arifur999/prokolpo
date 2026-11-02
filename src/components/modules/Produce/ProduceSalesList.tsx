"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatQuantity } from "@/lib/money";
import { batchStarted } from "@/lib/produceLook";
import { cn } from "@/lib/utils";
import type { IBatch, IProduceSale } from "@/types/produce.types";

const GRID = "lg:grid lg:grid-cols-[88px_minmax(0,1fr)_140px_118px_100px_104px] lg:items-center lg:gap-x-2.5";
const LIMIT = 8;

type ProduceSalesListProps = { sales: IProduceSale[]; batches: IBatch[]; highlight: string | null };

// "সব বিক্রি" (board FarmSales): every sale newest first, filtered by batch, eight at a time.
export function ProduceSalesList({ sales, batches, highlight }: ProduceSalesListProps) {
  const t = useTranslations("Produce.list");
  const tp = useTranslations("Produce");
  const [batch, setBatch] = useState("ALL");
  const [all, setAll] = useState(false);
  const names = new Map(batches.map((b) => [b.id, b.name]));
  const chips = [
    { id: "ALL", label: t("all") },
    ...batches
      .filter(batchStarted)
      .reverse()
      .map((b) => ({ id: b.id, label: b.name })),
  ];
  const filtered = sales.filter((s) => batch === "ALL" || s.phaseId === batch);
  const shown = all ? filtered : filtered.slice(0, LIMIT);

  return (
    <section aria-labelledby="fs-title" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center gap-3.5 border-b border-line-2 px-5 py-3">
        <h2 id="fs-title" className="m-0 text-[17px] font-semibold">
          {t("title")}
        </h2>
        <div role="group" aria-label={t("chips")} className="flex flex-wrap gap-1.5">
          {chips.map((c) => {
            const on = batch === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setBatch(c.id);
                  setAll(false);
                }}
                className={cn(
                  "h-8 cursor-pointer rounded-full px-2.75 text-[13px] text-ink",
                  on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <div role="table" aria-labelledby="fs-title">
        <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-4.5 text-[13px] font-semibold text-ink-2", GRID)}>
          <span role="columnheader">{t("date")}</span>
          <span role="columnheader">{t("what")}</span>
          <span role="columnheader">{t("qty")}</span>
          <span role="columnheader">{t("buyer")}</span>
          <span role="columnheader" className="text-right">
            {t("amount")}
          </span>
          <span role="columnheader">{t("paid")}</span>
        </div>
        {shown.map((s) => (
          <div
            key={s.id}
            role="row"
            className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 px-4.5 py-2", s.id === highlight && "bg-brand-wash", GRID)}
          >
            <span role="cell" className="text-sm text-ink-2">
              {dayFirst(s.date)}
            </span>
            <span role="cell" className="flex min-w-0 grow flex-col">
              <span className="truncate text-[15px] font-semibold">{tp(`products.${s.product}`)}</span>
              <span className="text-xs text-ink-3">{(s.phaseId && names.get(s.phaseId)) || t("noBatch")}</span>
            </span>
            <span role="cell" className="text-sm text-ink-2">
              {t("qtyLine", { qty: formatQuantity(s.quantity), unit: tp(`units.${s.unit}`), rate: formatAmount(s.rate) })}
            </span>
            <span role="cell" className="truncate text-sm">
              {s.buyer}
            </span>
            <span role="cell" className="text-right text-[15px] font-bold">
              {formatAmount(s.amount)}
            </span>
            <span role="cell">
              <span
                className={cn(
                  "rounded-full px-2 py-px text-xs font-bold whitespace-nowrap",
                  s.left > 0 ? "bg-gold-tint text-gold-ink" : "bg-brand-tint text-success",
                )}
              >
                {s.left > 0 ? t("left", { amount: formatAmount(s.left) }) : t("full")}
              </span>
            </span>
          </div>
        ))}
        {filtered.length === 0 && <p className="m-0 border-b border-line-3 px-5 py-6 text-center text-[15px] text-ink-3">{t("empty")}</p>}
        {filtered.length > LIMIT && (
          <button
            type="button"
            onClick={() => setAll(!all)}
            className="h-11 w-full cursor-pointer border-x-0 border-t-0 border-b border-line-3 bg-white text-sm font-semibold text-brand"
          >
            {all ? t("less") : t("more", { count: filtered.length - LIMIT })}
          </button>
        )}
        <div role="row" className={cn("flex flex-wrap gap-x-3 bg-surface-2 px-4.5 py-2.75 text-sm font-bold", GRID)}>
          <span role="cell">{t("total")}</span>
          <span role="cell" className="font-medium text-ink-2">
            {t("count", { count: filtered.length })}
          </span>
          <span role="cell" className="hidden lg:block" />
          <span role="cell" className="hidden lg:block" />
          <span role="cell" className="ml-auto text-right lg:ml-0">
            ৳ {formatAmount(filtered.reduce((n, s) => n + s.amount, 0))}
          </span>
          <span role="cell" className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
