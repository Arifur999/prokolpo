"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Segmented } from "@/components/shared/Segmented";
import { FRIDAY, manDays, manDaysText, weekDates } from "@/lib/attendance";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IAttendanceDay, ILedgerLine } from "@/types/books.types";

type Filter = "all" | "plus" | "pay";

type ContractorLedgerTableProps = {
  lines: ILedgerLine[];
  days: IAttendanceDay[];
  daily: boolean;
  today: string;
};

const GRID = "grid-cols-[96px_minmax(0,1fr)_110px_110px_120px]";
const dm = (iso: string) => dayFirst(iso).slice(0, 5);

type Look = { icon: string; well: string; tag?: { text: string; className: string } };

// "লেনদেনের খাতা" for a contractor: newest first, attendance summed per week with the days
// a click away (boards ContractorLedger, ContractorLedgerContract).
export function ContractorLedgerTable({ lines, days, daily, today }: ContractorLedgerTableProps) {
  const t = useTranslations("ContractorLedger");
  const tp = useTranslations("PayDialog.purposes");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const byDay = new Map(days.map((d) => [d.day, d]));

  const shown = [...lines].reverse().filter((l) => filter === "all" || (filter === "pay" ? l.kind === "PAYMENT" : l.kind !== "PAYMENT"));
  const sumPlus = shown.reduce((sum, l) => sum + l.charge, 0);
  const sumMinus = shown.reduce((sum, l) => sum + l.payment, 0);
  const owed = lines.at(-1)?.due ?? 0;
  const taka = (n: number) => (n < 0 ? t("advance", { amount: formatAmount(-n) }) : formatAmount(n));

  const describe = (l: ILedgerLine): { title: string; sub: string; look: Look } => {
    switch (l.kind) {
      case "WEEK": {
        const daysWorked = Number(l.detail ?? 0);
        const current = l.date <= today && today <= (l.title ?? "");
        return {
          title: t("week", { start: dm(l.date), end: dm(l.title ?? l.date) }),
          sub:
            t("weekSub", { days: manDaysText(daysWorked), rate: formatAmount(daysWorked ? Math.round(l.charge / daysWorked) : 0) }) +
            (current ? t("stillRunning") : ""),
          look: {
            icon: "হ",
            well: "bg-gold-tint text-gold-ink",
            tag: current ? { text: t("currentWeek"), className: "bg-brand-tint text-success" } : undefined,
          },
        };
      }
      case "PAYMENT":
        return {
          title: l.purpose ? tp(l.purpose) : t("payment"),
          sub: [l.account && t("fromAccount", { account: l.account }), l.detail].filter(Boolean).join(" · "),
          look: {
            icon: "৳",
            well: "bg-brand-tint text-success",
            tag: l.purpose === "ADVANCE" ? { text: t("advanceTag"), className: "bg-info-tint text-info" } : undefined,
          },
        };
      case "CONTRACT":
        return { title: t("contract"), sub: l.title ?? "", look: { icon: "চু", well: "bg-surface-4 text-ink-2" } };
      case "EXTRA":
        return {
          title: l.title ?? "",
          sub: "",
          look: { icon: "অ", well: "bg-gold-tint text-gold-ink", tag: { text: t("outsideContract"), className: "bg-surface-4 text-ink-2" } },
        };
      case "OPENING":
        return { title: t("opening"), sub: l.detail ?? "", look: { icon: "জ", well: "bg-surface-4 text-ink-2" } };
      default:
        return { title: l.title ?? "", sub: l.detail ?? "", look: { icon: "বি", well: "bg-surface-4 text-ink-2" } };
    }
  };

  return (
    <section aria-labelledby="lg-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-2 px-5 py-3.5">
        <div className="flex flex-col">
          <h2 id="lg-title" className="m-0 text-[17px] font-semibold">
            {t("tableTitle")}
          </h2>
          <span className="text-[13px] text-ink-3">{daily ? t("subDaily") : t("subContract")}</span>
        </div>
        <Segmented
          label={t("showLabel")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("all") },
            { value: "plus", label: daily ? t("plusDaily") : t("plusContract") },
            { value: "pay", label: t("payments") },
          ]}
        />
      </div>

      <div role="table" aria-labelledby="lg-title" className="overflow-x-auto">
        <div className="min-w-160">
          <div
            role="row"
            className={cn("grid h-10 items-center gap-x-2.5 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}
          >
            <span role="columnheader">{t("date")}</span>
            <span role="columnheader">{t("description")}</span>
            <span role="columnheader" className="text-right">
              {daily ? t("plusHeadDaily") : t("plusHeadContract")}
            </span>
            <span role="columnheader" className="text-right">
              {t("minusHead")}
            </span>
            <span role="columnheader" className="text-right">
              {t("running")}
            </span>
          </div>

          {shown.map((l) => {
            const { title, sub, look } = describe(l);
            const isOpen = open === l.ref;
            const isCurrent = l.kind === "WEEK" && l.date <= today && today <= (l.title ?? "");
            return (
              <div key={l.ref} role="row" className={cn("flex flex-col border-b border-line-3", isOpen ? "bg-surface-3" : "bg-white")}>
                <div className={cn("grid items-center gap-x-2.5 px-5 py-2.25", GRID, isCurrent && "shadow-[inset_3px_0_0_var(--color-brand-mid)]")}>
                  <span role="cell" className="text-sm text-ink-2">
                    {l.kind === "OPENING" ? "—" : dayFirst(l.date)}
                  </span>
                  <span role="cell" className="flex min-w-0 items-center gap-2.5">
                    <span aria-hidden="true" className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold", look.well)}>
                      {look.icon}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold">{title}</span>
                        {look.tag && (
                          <span className={cn("rounded-full px-1.75 text-[11px] font-bold whitespace-nowrap", look.tag.className)}>{look.tag.text}</span>
                        )}
                      </span>
                      {sub && <span className="truncate text-xs text-ink-3">{sub}</span>}
                    </span>
                    {l.kind === "WEEK" && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={t(isOpen ? "hideDaysLabel" : "showDaysLabel", { title })}
                        onClick={() => setOpen(isOpen ? null : l.ref)}
                        className="ml-auto h-7 shrink-0 cursor-pointer rounded-md border border-line-2 bg-white px-2 text-xs font-semibold text-brand"
                      >
                        {isOpen ? t("hideDays") : t("showDays")}
                      </button>
                    )}
                  </span>
                  <span role="cell" className="text-right text-[15px] font-semibold text-gold-ink">
                    {l.charge ? formatAmount(l.charge) : ""}
                  </span>
                  <span role="cell" className="text-right text-[15px] font-semibold text-success">
                    {l.payment ? formatAmount(l.payment) : ""}
                  </span>
                  <span role="cell" className={cn("text-right text-[15px] font-bold", l.due < 0 && "text-info")}>
                    {taka(l.due)}
                  </span>
                </div>
                {isOpen && (
                  <div className="grid grid-cols-7 gap-1.5 pr-5 pb-3 pl-34">
                    {weekDates(l.date).map((iso, i) => {
                      const d = byDay.get(iso);
                      const off = i === FRIDAY && !d;
                      return (
                        <span
                          key={iso}
                          className={cn("flex flex-col items-center rounded-lg py-1.25", d ? "bg-brand-tint text-brand" : "bg-surface-4 text-ink-3")}
                        >
                          <span className="text-[11px]">{t(`weekdays.${String(i) as "0"}`)}</span>
                          <strong className="text-sm font-bold">{d ? manDaysText(manDays(d)) : off ? t("holiday") : "—"}</strong>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {shown.length === 0 && <p className="m-0 px-6 py-10 text-center text-sm text-ink-3">{t("empty")}</p>}

          <div role="row" className={cn("grid items-center gap-x-2.5 bg-surface-2 px-5 py-3 text-sm font-bold", GRID)}>
            <span role="cell">{t("total")}</span>
            <span role="cell" className="font-medium text-ink-2">
              {daily ? t("footDaily") : t("footContract")}
            </span>
            <span role="cell" className="text-right text-gold-ink">
              {formatAmount(sumPlus)}
            </span>
            <span role="cell" className="text-right text-success">
              {formatAmount(sumMinus)}
            </span>
            <span role="cell" className="text-right text-base">
              {owed < 0 ? t("advance", { amount: formatAmount(-owed) }) : `৳ ${formatAmount(owed)}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
