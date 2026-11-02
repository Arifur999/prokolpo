"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { nameInitials } from "@/lib/memberLook";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { customerState, type CustomerState } from "@/lib/saleLook";
import { cn } from "@/lib/utils";
import type { ICustomer } from "@/types/sales.types";
import { CustomerDialog } from "./CustomerDialog";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_150px_160px_120px_196px_100px_84px] lg:items-center lg:gap-x-3";
const FILTERS = ["ALL", "LATE", "RUNNING", "PAID", "LEAD"] as const;
const PILL: Record<CustomerState, string> = {
  LATE: "bg-danger-tint text-danger",
  RUNNING: "bg-brand-tint text-success",
  PAID: "bg-surface-4 text-ink-2",
  LEAD: "bg-info-tint text-info",
};
const squash = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();
const day = (iso: string) => dayFirst(iso.slice(0, 10));

const totals = (c: ICustomer) => ({
  price: c.sales.reduce((n, s) => n + s.price, 0),
  paid: c.sales.reduce((n, s) => n + s.standing.received, 0),
  due: c.sales.reduce((n, s) => n + Math.max(0, s.standing.due), 0),
  last: c.sales
    .map((s) => s.standing.lastPaid ?? s.date)
    .sort()
    .at(-1),
});

// The customers page (boards CustomerList, CustomerAdd): who bought what, who owes, who is late.
export function CustomersView({
  projectId,
  projectName,
  customers,
  canWrite,
}: {
  projectId: string;
  projectName: string;
  customers: ICustomer[];
  canWrite: boolean;
}) {
  const t = useTranslations("Customers");
  const [filter, setFilter] = useState<CustomerState | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const counts = { ALL: customers.length, LATE: 0, RUNNING: 0, PAID: 0, LEAD: 0 };
  for (const c of customers) counts[customerState(c.sales)]++;
  const shown = customers.filter(
    (c) =>
      (filter === "ALL" || customerState(c.sales) === filter) &&
      (!q || [c.name, c.phone, c.nid ?? "", ...c.sales.map((s) => s.unitName)].some((v) => squash(v).includes(squash(q)))),
  );
  const owing = customers.filter((c) => totals(c).due > 0);
  const late = customers.filter((c) => customerState(c.sales) === "LATE");
  const sum = (list: ICustomer[], pick: (x: ReturnType<typeof totals>) => number) => list.reduce((n, c) => n + pick(totals(c)), 0);
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          canWrite && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white"
            >
              <Icon name="userPlus" size={18} strokeWidth={2} />
              {t("add")}
            </button>
          )
        }
      />
      <section aria-label={t("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("total")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">{customers.length}</p>
          <p className="m-0 text-[13px] text-ink-3">{t("totalSub", { bought: customers.length - counts.LEAD, leads: counts.LEAD })}</p>
        </article>
        <article className={cn(card, "border-gold-line bg-gold-wash")}>
          <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(sum(customers, (x) => x.due))}</p>
          <p className="m-0 text-[13px] text-ink-2">{t("dueSub", { count: owing.length })}</p>
        </article>
        <article className={cn(card, "border-danger-line bg-danger-tint")}>
          <h2 className="m-0 text-sm font-semibold text-danger">{t("late")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-bold">
            ৳ {formatAmount(late.reduce((n, c) => n + c.sales.reduce((m, s) => m + s.standing.lateSum, 0), 0))}
          </p>
          <p className="m-0 text-[13px] text-ink-2">
            {late.length
              ? t("lateSub", { count: late.length, installments: late.reduce((n, c) => n + c.sales.reduce((m, s) => m + s.standing.lateCount, 0), 0) })
              : t("noLate")}
          </p>
        </article>
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("paid")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">{counts.PAID}</p>
          <p className="m-0 text-[13px] text-ink-3">{t("paidSub", { count: counts.PAID })}</p>
        </article>
      </section>

      <section aria-labelledby="cl-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-wrap items-center gap-4 border-b border-line-2 px-5 py-3">
          <h2 id="cl-title" className="m-0 text-[17px] font-semibold">
            {t("listTitle")}
          </h2>
          <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-8.5 cursor-pointer rounded-full px-3 text-sm text-ink",
                  filter === f ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
                )}
              >
                {t(`filter.${f}`)} <span className="text-ink-3">{counts[f]}</span>
              </button>
            ))}
          </div>
          <label className="relative ml-auto flex items-center">
            <span className="sr-only">{t("search")}</span>
            <Icon name="search" size={18} strokeWidth={2} className="pointer-events-none absolute left-3 text-ink-3" />
            <input
              type="search"
              placeholder={t("search")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-62.5 rounded-[10px] border border-line bg-white pr-3 pl-9.5 text-[15px] text-ink outline-none"
            />
          </label>
        </div>
        <div role="table" aria-labelledby="cl-title">
          <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}>
            <span role="columnheader">{t("colCustomer")}</span>
            <span role="columnheader">{t("colBought")}</span>
            <span role="columnheader">{t("colPaid")}</span>
            <span role="columnheader" className="text-right">
              {t("colDue")}
            </span>
            <span role="columnheader">{t("colState")}</span>
            <span role="columnheader">{t("colLast")}</span>
            <span role="columnheader">
              <span className="sr-only">{t("colActions")}</span>
            </span>
          </div>
          {shown.map((c) => (
            <CustomerRow key={c.id} projectId={projectId} customer={c} />
          ))}
          {shown.length === 0 && <p className="m-0 px-5 py-7 text-center text-[15px] text-ink-3">{t("none")}</p>}
          <div role="row" className={cn("flex flex-wrap gap-x-4 bg-surface-2 px-5 py-3 text-sm font-bold", GRID)}>
            <span role="cell">{t("totalRow", { count: shown.length })}</span>
            <span role="cell">৳ {formatAmount(sum(shown, (x) => x.price))}</span>
            <span role="cell" className="text-success">
              ৳ {formatAmount(sum(shown, (x) => x.paid))}
            </span>
            <span role="cell" className="text-right text-gold-ink">
              ৳ {formatAmount(sum(shown, (x) => x.due))}
            </span>
          </div>
        </div>
      </section>
      {adding && <CustomerDialog projectId={projectId} customers={customers} onClose={() => setAdding(false)} />}
    </>
  );
}

function CustomerRow({ projectId, customer: c }: { projectId: string; customer: ICustomer }) {
  const t = useTranslations("Customers");
  const sum = totals(c);
  const state = customerState(c.sales);
  const first = c.sales[0];
  const percent = sum.price ? Math.min(100, (sum.paid / sum.price) * 100) : 0;
  const href = projectHref(projectId, `customers/${c.id}`);
  const late = c.sales.find((s) => s.standing.late)?.standing.late;
  const next = c.sales.map((s) => s.standing.next).find(Boolean);
  const sub = late
    ? t("stateLate", { no: late.no, days: late.days })
    : state === "RUNNING" && next
      ? t("stateNext", { date: day(next.date) })
      : state === "PAID"
        ? t("statePaid")
        : t("stateLead", { date: day(c.createdAt) });

  return (
    <div role="row" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line-3 px-5 py-3 lg:min-h-16.5 lg:py-0", GRID)}>
      <span role="cell" className="flex min-w-0 grow items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            state === "LEAD" ? "bg-info-tint text-info" : "bg-brand-tint text-brand",
          )}
        >
          {nameInitials(c.name)}
        </span>
        <span className="flex min-w-0 flex-col">
          <Link href={href} className="truncate text-[15px] font-semibold text-ink no-underline hover:text-brand">
            {c.name}
          </Link>
          <span className="text-[13px] text-ink-3">{displayPhone(c.phone)}</span>
        </span>
      </span>
      <span role="cell" className="flex flex-col">
        <span className={cn("text-[15px] font-semibold", first ? "text-ink" : "text-ink-4")}>{first ? first.unitName : t("notBought")}</span>
        {c.sales.length > 1 && <span className="text-xs text-ink-3">{t("boughtMore", { count: c.sales.length - 1 })}</span>}
      </span>
      <span role="cell" className="flex min-w-36 flex-col gap-0.75">
        {first ? (
          <>
            <span className="flex justify-between text-[13px]">
              <span>{formatAmount(sum.paid)}</span>
              <span className="text-ink-3">{Math.round(percent)}%</span>
            </span>
            <span className="h-1.25 overflow-hidden rounded-full bg-line-3">
              <span className="block h-full bg-brand-mid" style={{ width: `${percent.toFixed(1)}%` }} />
            </span>
          </>
        ) : (
          <span className="text-[13px] text-ink-4">—</span>
        )}
      </span>
      <span role="cell" className={cn("text-right text-[15px] font-bold", sum.due > 0 ? "text-gold-ink" : "text-ink-4")}>
        {sum.due > 0 ? formatAmount(sum.due) : "—"}
      </span>
      <span role="cell" className="flex flex-col items-start gap-0.5">
        <span className={cn("rounded-full px-2.25 py-px text-[13px] font-semibold whitespace-nowrap", PILL[state])}>{t(`state.${state}`)}</span>
        <span className="max-w-full truncate text-xs text-ink-3">{sub}</span>
      </span>
      <span role="cell" className="text-sm text-ink-2">
        {sum.last && first ? day(sum.last) : "—"}
      </span>
      <span role="cell" className="ml-auto flex items-center justify-end gap-1.5">
        <a
          href={`tel:${c.phone}`}
          aria-label={t("call", { name: c.name })}
          title={t("call", { name: c.name })}
          className="flex size-8.5 items-center justify-center rounded-[9px] border border-line-2 bg-white text-brand"
        >
          <Icon name="phone" size={16} strokeWidth={2} />
        </a>
        <Link
          href={href}
          aria-label={t("detail", { name: c.name })}
          className="flex size-8.5 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
        >
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Link>
      </span>
    </div>
  );
}
