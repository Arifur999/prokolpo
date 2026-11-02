"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatPercent } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { saleState } from "@/lib/saleLook";
import { floorShort } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { ISaleDetail } from "@/types/sales.types";
import { CollectDialog } from "../CollectDialog";
import { SaleSchedule } from "./SaleSchedule";
import { SaleSide } from "./SaleSide";

type SaleDetailViewProps = {
  projectId: string;
  projectName: string;
  detail: ISaleDetail;
  accounts: PickableAccount[];
  today: string;
  canWrite: boolean;
  openCollect: boolean;
  from: string;
};

const STATE_PILL = { RUNNING: "bg-gold-tint text-gold-ink", LATE: "bg-danger-tint text-danger", PAID: "bg-brand-tint text-success" };
const day = (iso: string) => dayFirst(iso.slice(0, 10));

// One sale's page (board SaleDetail): what it sold for, what came in, what is next, every
// installment, and the buyer.
export function SaleDetailView({ projectId, projectName, detail, accounts, today, canWrite, openCollect, from }: SaleDetailViewProps) {
  const t = useTranslations("SaleDetail");
  const ts = useTranslations("Sales");
  const tu = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";
  const [collecting, setCollecting] = useState(openCollect && detail.sale.standing.due > 0);
  const { sale, rows } = detail;
  const st = sale.standing;
  const state = saleState(sale);
  const percent = (st.received / sale.price) * 100;
  const open = rows.filter((r) => r.paid < r.amount);
  const focus = st.late ?? st.next;
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

  return (
    <>
      <div className="flex flex-col gap-4">
        <nav aria-label={ts("title")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "sales")} className="text-ink-2 no-underline">
            {ts("title")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {sale.unitName}
          </span>
        </nav>
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <Icon name="key" size={26} strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="m-0 flex flex-wrap items-center gap-3 text-2xl leading-[1.3] font-semibold lg:text-[28px]">
                {sale.unitName} · {sale.customer}
                <span className={cn("rounded-full px-2.5 py-px text-sm font-bold", STATE_PILL[state])}>{t(`status.${state}`)}</span>
              </h1>
              <p className="m-0 flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm text-ink-2">
                <span>
                  {[tu("floor", { floor: floorShort(locale, sale.floor) }), tu(`type.${sale.unitType}`), sale.size ? `${sale.size} sqft` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={15} strokeWidth={2} />
                  {t("sold", { date: day(sale.date) })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="phone" size={15} strokeWidth={2} />
                  {displayPhone(sale.phone)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-line bg-white px-4 text-[15px] font-semibold text-ink"
            >
              <Icon name="printer" size={18} strokeWidth={2} />
              {t("print")}
            </button>
            {canWrite && (
              <button
                type="button"
                disabled={st.due <= 0}
                onClick={() => setCollecting(true)}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand px-4.5 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9DB5AC]"
              >
                <Icon name="banknote" size={18} strokeWidth={2} />
                {t("collect")}
              </button>
            )}
          </div>
        </header>
      </div>

      <section aria-label={ts("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("price")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(sale.price)}</p>
          <p className="m-0 text-[13px] text-ink-3">
            {sale.listPrice > sale.price
              ? t("priceLess", { list: formatAmount(sale.listPrice), amount: formatAmount(sale.listPrice - sale.price) })
              : t("priceSame")}
          </p>
        </article>
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("received")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(st.received)}</p>
          <div role="img" aria-label={t("receivedAria", { percent: formatPercent(percent) })} className="flex items-center gap-2">
            <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
              <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, percent).toFixed(1)}%` }} />
            </span>
            <span className="text-[13px] text-ink-3">{formatPercent(percent)}</span>
          </div>
        </article>
        <article className={cn(card, "border-gold-line bg-gold-wash")}>
          <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(Math.max(0, st.due))}</p>
          <p className="m-0 text-[13px] text-ink-2">
            {open.length ? t("dueSub", { count: open.length, date: day(rows.at(-1)?.due ?? sale.date) }) : t("dueNone")}
          </p>
        </article>
        <article className={cn(card, st.late ? "border-danger-line bg-danger-tint" : "border-line-2 bg-white")}>
          <h2 className={cn("m-0 text-sm font-semibold", st.late ? "text-danger" : "text-ink-2")}>{st.late ? t("lateHead") : t("nextHead")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-bold">{focus ? day(focus.date) : "—"}</p>
          <p className="m-0 text-[13px] text-ink-2">
            {st.late
              ? t("lateSub", { no: st.late.no, amount: formatAmount(st.late.amount), days: st.late.days })
              : focus
                ? t("nextSub", { no: focus.no, amount: formatAmount(focus.amount) })
                : t("nothingNext")}
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SaleSchedule projectId={projectId} detail={detail} today={today} />
        <SaleSide projectId={projectId} projectName={projectName} detail={detail} from={from} />
      </div>

      {collecting && <CollectDialog projectId={projectId} sale={{ ...sale, rows }} accounts={accounts} onClose={() => setCollecting(false)} />}
    </>
  );
}
