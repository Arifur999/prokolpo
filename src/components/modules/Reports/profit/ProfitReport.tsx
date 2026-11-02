"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { Segmented } from "@/components/shared/Segmented";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatPercent } from "@/lib/money";
import { partnerColor } from "@/lib/partnerMath";
import type { profitReport, Scenario } from "@/lib/reportProfit";
import { cn } from "@/lib/utils";

type ProfitReportProps = {
  report: ReturnType<typeof profitReport>;
  scenario: Scenario;
  hasBudget: boolean;
  startDate: string;
  today: string;
  onScenario: (scenario: Scenario) => void;
};

const taka = (n: number) => `${n < 0 ? "− " : ""}৳ ${formatAmount(Math.abs(n))}`;
const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_70px_130px_200px_130px_130px] lg:items-center lg:gap-x-3";

// Profit and partners' shares (board ReportProfit).
export function ProfitReport({ report: p, scenario, hasBudget, startDate, today, onScenario }: ProfitReportProps) {
  const t = useTranslations("Reports.profit");
  const maxShare = Math.max(1, ...p.shares.map((s) => s.share));
  const loss = p.profit < 0;
  const rows = [
    {
      key: "sold",
      sign: "+",
      signClass: "bg-brand-tint text-success",
      label: t("sold", { count: p.soldCount }),
      sub: t("soldSub", { received: formatAmount(p.received), due: formatAmount(p.customerDue) }),
      value: p.sold,
    },
    {
      key: "cost",
      sign: "−",
      signClass: "bg-gold-tint text-gold-ink",
      label: p.onBudget ? t("costBudget") : t("costNow"),
      sub: p.onBudget
        ? t("costBudgetSub", { spent: formatAmount(p.spent), rest: formatAmount(p.rest) })
        : t("costNowSub", { from: dayFirst(startDate), to: dayFirst(today) }),
      value: p.cost,
    },
  ];

  return (
    <>
      {hasBudget && (
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Segmented
            label={t("scenarioLabel")}
            size="lg"
            value={scenario}
            options={(["BUDGET", "NOW"] as const).map((s) => ({ value: s, label: t(s) }))}
            onChange={onScenario}
          />
          <span className="text-[13px] text-ink-3">{scenario === "BUDGET" ? t("noteBudget") : t("noteNow")}</span>
        </div>
      )}
      <section aria-labelledby="pl-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="border-b border-line-2 px-5 py-4">
          <h2 id="pl-title" className="m-0 text-lg font-semibold">
            {t("title")}
          </h2>
        </div>
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line-3 px-5 py-3">
            <span aria-hidden="true" className={cn("flex size-6.5 items-center justify-center rounded-full text-base font-bold", r.signClass)}>
              {r.sign}
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">{r.label}</span>
              <span className="text-xs text-ink-3">{r.sub}</span>
            </span>
            <span className="text-right text-[15px] font-bold">{taka(r.value)}</span>
          </div>
        ))}
        <div
          className={cn(
            "grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line-3 px-5 py-3",
            loss ? "bg-danger-tint" : "bg-brand-wash",
          )}
        >
          <span aria-hidden="true" className="flex size-6.5 items-center justify-center rounded-full bg-brand text-base font-bold text-white">
            =
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-bold">{p.onBudget ? (loss ? t("lossBudget") : t("profitBudget")) : loss ? t("lossNow") : t("profitNow")}</span>
            <span className="text-xs text-ink-3">{p.shares.length ? t("profitSub") : t("profitSubSolo")}</span>
          </span>
          <span className={cn("text-right text-lg font-bold", loss ? "text-danger" : "text-success")}>{taka(p.profit)}</span>
        </div>
        <p className="m-0 flex gap-2 px-5 py-3 text-[13px] leading-[1.55] text-ink-2">
          <Icon name="info" size={18} strokeWidth={2} className="shrink-0 text-ink-3" />
          <span>{p.unsoldCount ? t("note", { count: p.unsoldCount, amount: formatAmount(p.unsoldValue) }) : t("noteAllSold")}</span>
        </p>
      </section>
      {p.shares.length > 0 && (
        <section aria-labelledby="ps-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line-2 px-5 py-3.5">
            <h2 id="ps-title" className="m-0 text-[17px] font-semibold">
              {t("shares")}
            </h2>
            <span className="text-[13px] text-ink-3">{t("sharesSub")}</span>
          </div>
          <div role="table" aria-labelledby="ps-title">
            <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}>
              <span role="columnheader">{t("cols.partner")}</span>
              <span role="columnheader">{t("cols.share")}</span>
              <span role="columnheader" className="text-right">
                {t("cols.capital")}
              </span>
              <span role="columnheader">{t("cols.part")}</span>
              <span role="columnheader" className="text-right">
                {t("cols.due")}
              </span>
              <span role="columnheader" className="text-right">
                {t("cols.net")}
              </span>
            </div>
            {p.shares.map((s) => (
              <div key={s.id} role="row" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 px-5 py-2.5", GRID)}>
                <span role="cell" className="flex w-full min-w-0 items-center gap-2.5 lg:w-auto">
                  <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: partnerColor(s.color) }} />
                  <span className="truncate text-[15px] font-semibold">{s.name}</span>
                </span>
                <span role="cell" className="text-[15px] font-bold">
                  {formatPercent(s.share)}
                </span>
                <span role="cell" className="text-right text-sm text-ink-2">
                  ৳ {formatAmount(s.capital)}
                </span>
                <span role="cell" className="flex grow items-center gap-2 lg:grow-0">
                  <span className="h-2.5 grow overflow-hidden rounded-full bg-line-3">
                    <span className="block h-full" style={{ width: `${((s.share / maxShare) * 100).toFixed(1)}%`, background: partnerColor(s.color) }} />
                  </span>
                  <strong className="text-sm font-bold whitespace-nowrap">{taka(s.part)}</strong>
                </span>
                <span role="cell" className={cn("text-right text-sm", s.owed ? "text-gold-ink" : "text-ink-5")}>
                  {s.owed ? `− ৳ ${formatAmount(s.owed)}` : "—"}
                </span>
                <span role="cell" className={cn("ml-auto text-right text-[15px] font-bold lg:ml-0", s.net < 0 ? "text-danger" : "text-success")}>
                  {taka(s.net)}
                </span>
              </div>
            ))}
            <div role="row" className={cn("flex flex-wrap gap-x-3 bg-surface-2 px-5 py-3 text-sm font-bold", GRID)}>
              <span role="cell">{t("sum")}</span>
              <span role="cell">100%</span>
              <span role="cell" className="text-right">
                ৳ {formatAmount(p.capital)}
              </span>
              <span role="cell" className="text-right">
                {taka(p.profit)}
              </span>
              <span role="cell" className="text-right text-gold-ink">
                − ৳ {formatAmount(p.owed)}
              </span>
              <span role="cell" className={cn("text-right", p.profit - p.owed < 0 ? "text-danger" : "text-success")}>
                {taka(p.profit - p.owed)}
              </span>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
