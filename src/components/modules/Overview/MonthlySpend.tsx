"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Panel, PanelEmpty } from "./Panel";

export type MonthSpend = { label: string; amount: number };

const LAKH = 100_000;
// The top gridline sits 180px up; three gridlines above the baseline.
const TOP_PX = 180;
const TICKS = 3;

// Rounds the axis up to a whole number of lakh per gridline (10, 20, 30 lakh...).
const axisStep = (max: number) => Math.max(1, Math.ceil(max / TICKS / LAKH)) * LAKH;

// "মাস অনুযায়ী খরচ": a bar per month, the latest in dark green with its amount on top (board Main).
export function MonthlySpend({ months, range }: { months: MonthSpend[]; range: string }) {
  const t = useTranslations("Overview.byMonth");
  const [span, setSpan] = useState<6 | 12>(6);
  const shown = months.slice(-span);
  const step = axisStep(Math.max(0, ...shown.map((m) => m.amount)));
  const height = (amount: number) => Math.round((amount / (step * TICKS)) * TOP_PX);

  const periodToggle = (
    <div role="group" aria-label={t("period")} className="flex shrink-0 gap-0.5 rounded-lg bg-surface-4 p-0.75">
      {([6, 12] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={span === value}
          onClick={() => setSpan(value)}
          className={cn(
            "h-8 cursor-pointer rounded-md border-none px-3 text-sm",
            span === value ? "bg-white font-semibold text-ink shadow-tab" : "bg-transparent font-medium text-ink-2",
          )}
        >
          {t(value === 6 ? "six" : "twelve")}
        </button>
      ))}
    </div>
  );

  return (
    <Panel title={t("title")} subtitle={range} aside={periodToggle} className="lg:col-span-2">
      {shown.every((m) => m.amount === 0) ? (
        <PanelEmpty>{t("empty")}</PanelEmpty>
      ) : (
        <figure aria-label={t("chartLabel")} className="m-0 flex grow flex-col justify-end gap-2">
          <div className="relative h-54">
            {Array.from({ length: TICKS + 1 }, (_, i) => (
              <div key={i}>
                <div className={cn("absolute right-0 left-14 h-px", i === 0 ? "bg-line-strong" : "bg-line-3")} style={{ bottom: (TOP_PX / TICKS) * i }} />
                <span className="absolute left-0 w-11.5 text-right text-[13px] leading-5 text-ink-3" style={{ bottom: (TOP_PX / TICKS) * i - 10 }}>
                  {i === 0 ? "0" : t("lakh", { n: (step * i) / LAKH })}
                </span>
              </div>
            ))}
            <div className="absolute top-0 right-0 bottom-px left-14 flex items-end">
              {shown.map((month, index) => {
                const latest = index === shown.length - 1;
                return (
                  <div key={month.label} className="flex flex-1 flex-col items-center gap-1.5">
                    {latest && <span className="text-[13px] font-semibold whitespace-nowrap text-ink">৳ {formatAmount(month.amount)}</span>}
                    <div
                      title={`${month.label}: ৳ ${formatAmount(month.amount)}`}
                      className={cn("w-10 rounded-t", latest ? "bg-brand" : "bg-brand-mid")}
                      style={{ height: height(month.amount) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ml-14 flex">
            {shown.map((month, index) => (
              <span key={month.label} className={cn("flex-1 text-center text-[13px]", index === shown.length - 1 ? "font-semibold text-ink" : "text-ink-3")}>
                {month.label}
              </span>
            ))}
          </div>
        </figure>
      )}
    </Panel>
  );
}
