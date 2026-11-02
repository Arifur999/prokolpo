"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { saleReceiptHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ISaleDetail, IScheduleRow } from "@/types/sales.types";

const GRID = "grid grid-cols-[96px_96px_96px_minmax(0,1fr)_40px] items-center gap-x-2 lg:grid-cols-[108px_104px_108px_minmax(0,1fr)_150px_40px]";
const SHOWN = 10;
const day = (iso: string) => dayFirst(iso.slice(0, 10));
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to.slice(0, 10)) - Date.parse(from.slice(0, 10))) / 86_400_000);

type RowState = "paid" | "part" | "late" | "next" | "open";

const STATUS_KEY = { paid: "rowPaid", part: "rowPart", late: "rowLate", next: "rowNext", open: "rowOpen" } as const;

const PILL: Record<RowState, string> = {
  paid: "bg-brand-tint text-success border-transparent",
  part: "bg-gold-tint text-gold-ink border-transparent",
  late: "bg-danger-tint text-danger border-transparent",
  next: "bg-white text-brand border-brand",
  open: "bg-surface-4 text-ink-2 border-transparent",
};

// "কিস্তির তালিকা" (board SaleDetail): the down payment and every installment with what came
// in, when, its state and its receipt.
export function SaleSchedule({ projectId, detail, today }: { projectId: string; detail: ISaleDetail; today: string }) {
  const t = useTranslations("SaleDetail");
  const [all, setAll] = useState(false);
  const { sale, rows, payments } = detail;
  const down = payments.find((p) => p.kind === "DOWN");
  const nextNo = sale.standing.next?.no;
  const receiptOn = (date: string | null) => (date ? payments.find((p) => p.kind === "INSTALLMENT" && p.date.slice(0, 10) === date.slice(0, 10)) : undefined);
  const stateOf = (r: IScheduleRow): RowState => {
    if (r.paid >= r.amount) return "paid";
    if (r.due.slice(0, 10) < today) return "late";
    if (r.paid > 0) return "part";
    return r.no === nextNo ? "next" : "open";
  };
  const shown = all ? rows : rows.slice(0, SHOWN);
  const last = rows.at(-1);

  return (
    <section aria-labelledby="ks-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-col gap-0.5 border-b border-line-2 px-5 py-4">
        <h2 id="ks-title" className="m-0 text-[17px] font-semibold">
          {t("schedTitle")}
        </h2>
        <p className="m-0 text-sm text-ink-2">{sale.installments ? t("schedSub", { count: sale.installments }) : t("schedFull")}</p>
      </div>
      <div role="table" aria-labelledby="ks-title" className="overflow-x-auto">
        <div role="row" className={cn(GRID, "h-10 border-b border-line-2 bg-surface-2 pr-4 pl-5 text-[13px] font-semibold text-ink-2")}>
          <span role="columnheader">{t("colNo")}</span>
          <span role="columnheader">{t("colDue")}</span>
          <span role="columnheader" className="text-right">
            {t("colAmount")}
          </span>
          <span role="columnheader" className="pl-3">
            {t("colPaid")}
          </span>
          <span role="columnheader" className="hidden lg:block">
            {t("colState")}
          </span>
          <span role="columnheader">
            <span className="sr-only">{t("colReceipt")}</span>
          </span>
        </div>
        <Line
          label={sale.installments ? t("down") : t("full")}
          due={day(sale.date)}
          amount={sale.down}
          paid={down?.amount ?? 0}
          paidOn={down ? day(down.date) : ""}
          state="paid"
          status={t("rowPaid")}
          receipt={down && { href: saleReceiptHref(projectId, down.id), label: t("receiptLabel", { no: down.receiptNo }) }}
          bold
        />
        {shown.map((r) => {
          const state = stateOf(r);
          const paidReceipt = receiptOn(r.lastPaidOn);
          const note =
            state === "paid" && r.paidOn && daysBetween(r.due, r.paidOn) > 0
              ? t("noteSlow", { days: daysBetween(r.due, r.paidOn) })
              : state === "late"
                ? t("noteLate", { days: daysBetween(r.due, today) })
                : state === "part"
                  ? t("noteLeft", { amount: formatAmount(r.amount - r.paid) })
                  : "";
          return (
            <Line
              key={r.no}
              label={t("row", { no: r.no })}
              due={day(r.due)}
              amount={r.amount}
              paid={r.paid}
              paidOn={r.lastPaidOn ? day(r.lastPaidOn) : ""}
              state={state}
              status={t(STATUS_KEY[state])}
              note={note}
              receipt={paidReceipt && { href: saleReceiptHref(projectId, paidReceipt.id), label: t("receiptLabel", { no: paidReceipt.receiptNo }) }}
            />
          );
        })}
        {rows.length > SHOWN && last && (
          <button
            type="button"
            aria-expanded={all}
            onClick={() => setAll((v) => !v)}
            className="flex h-11.5 w-full cursor-pointer items-center justify-center gap-2 border-x-0 border-t-0 border-b border-line-3 bg-white text-sm font-semibold text-brand"
          >
            {all ? t("less") : t("more", { count: rows.length - SHOWN, from: SHOWN + 1, to: rows.length, date: day(last.due) })}
            <Icon name="chevronDown" size={16} strokeWidth={2} className={cn(all && "rotate-180")} />
          </button>
        )}
        <div role="row" className={cn(GRID, "bg-surface-2 py-3 pr-4 pl-5 text-sm font-bold")}>
          <span role="cell">{t("total")}</span>
          <span role="cell" />
          <span role="cell" className="text-right">
            {formatAmount(sale.price)}
          </span>
          <span role="cell" className="pl-3 text-success">
            {t("totalPaid", { amount: formatAmount(sale.standing.received) })}
          </span>
          <span role="cell" className="hidden text-gold-ink lg:block">
            {t("totalDue", { amount: formatAmount(Math.max(0, sale.standing.due)) })}
          </span>
          <span role="cell" />
        </div>
      </div>
    </section>
  );
}

type LineProps = {
  label: string;
  due: string;
  amount: number;
  paid: number;
  paidOn: string;
  state: RowState;
  status: string;
  note?: string;
  receipt?: { href: string; label: string } | false;
  bold?: boolean;
};

function Line({ label, due, amount, paid, paidOn, state, status, note, receipt, bold }: LineProps) {
  return (
    <div
      role="row"
      className={cn(GRID, "min-h-12.5 border-b border-line-3 pr-4 pl-5", state === "next" && "bg-brand-wash shadow-[inset_3px_0_0_var(--color-brand)]")}
    >
      <span role="cell" className={cn("text-[15px]", bold || state === "next" ? "font-bold" : "font-medium")}>
        {label}
      </span>
      <span role="cell" className="text-sm text-ink-2">
        {due}
      </span>
      <span role="cell" className="text-right text-[15px] font-semibold">
        ৳ {formatAmount(amount)}
      </span>
      <span role="cell" className="flex min-w-0 flex-col pl-3">
        <span className={cn("text-sm font-semibold", paid ? "text-success" : "text-ink-4")}>{paid ? `৳ ${formatAmount(paid)}` : "—"}</span>
        <span className="text-xs text-ink-3">{paidOn}</span>
      </span>
      <span role="cell" className="hidden flex-col items-start lg:flex">
        <span className={cn("rounded-full border px-2.25 py-px text-[13px] font-semibold whitespace-nowrap", PILL[state])}>{status}</span>
        {note && <span className="text-xs text-ink-3">{note}</span>}
      </span>
      <span role="cell" className="flex justify-end">
        {receipt && (
          <Link
            href={receipt.href}
            aria-label={receipt.label}
            title={receipt.label}
            className="flex size-8.5 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
          >
            <Icon name="receipt" size={16} strokeWidth={2} />
          </Link>
        )}
      </span>
    </div>
  );
}
