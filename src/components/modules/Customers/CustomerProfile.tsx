"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { nameInitials } from "@/lib/memberLook";
import { formatAmount, formatPercent } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref, saleReceiptHref } from "@/lib/routes";
import { customerState } from "@/lib/saleLook";
import { floorShort, STATUS_LOOK } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { ICustomer } from "@/types/sales.types";

const day = (iso: string) => dayFirst(iso.slice(0, 10));
const daysLate = (due: string, paid: string) => Math.round((Date.parse(paid.slice(0, 10)) - Date.parse(due.slice(0, 10))) / 86_400_000);
const PILL = { LATE: "bg-danger-tint text-danger", RUNNING: "bg-gold-tint text-gold-ink", PAID: "bg-brand-tint text-success", LEAD: "bg-info-tint text-info" };

// A customer's profile (board CustomerProfile): what they bought, paid and owe, how
// punctual they are, every payment, and how to reach them.
export function CustomerProfile({ projectId, customer: c, canWrite }: { projectId: string; customer: ICustomer; canWrite: boolean }) {
  const t = useTranslations("Customers.profile");
  const tc = useTranslations("Customers");
  const tu = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";
  const state = customerState(c.sales);
  const price = c.sales.reduce((n, s) => n + s.price, 0);
  const paid = c.sales.reduce((n, s) => n + s.standing.received, 0);
  const due = c.sales.reduce((n, s) => n + Math.max(0, s.standing.due), 0);
  const done = c.sales.flatMap((s) => (s.rows ?? []).filter((r) => r.paidOn));
  const lateRows = done.filter((r) => r.paidOn && daysLate(r.due, r.paidOn) > 0);
  const avgLate = lateRows.length ? Math.round(lateRows.reduce((n, r) => n + daysLate(r.due, r.paidOn ?? r.due), 0) / lateRows.length) : 0;
  const next = c.sales.map((s) => s.standing.next).find(Boolean);
  const owing = c.sales.find((s) => s.standing.due > 0);
  const payments = c.payments ?? [];
  const percent = price ? (paid / price) * 100 : 0;
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

  return (
    <>
      <div className="flex flex-col gap-4">
        <nav aria-label={tc("title")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "customers")} className="text-ink-2 no-underline">
            {tc("title")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {c.name}
          </span>
        </nav>
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="flex size-15 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[19px] font-bold text-brand">
              {nameInitials(c.name)}
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="m-0 flex flex-wrap items-center gap-2.5 text-2xl leading-[1.3] font-semibold lg:text-[28px]">
                {c.name}
                <span className={cn("rounded-full px-2.5 py-px text-sm font-bold", PILL[state])}>{tc(`filter.${state}`)}</span>
              </h1>
              <p className="m-0 flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm text-ink-2">
                <span className="flex items-center gap-1.5">
                  <Icon name="phone" size={15} strokeWidth={2} />
                  {displayPhone(c.phone)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={15} strokeWidth={2} />
                  {t("since", { date: day(c.createdAt) })}
                </span>
                <span>{c.sales.length ? t("units", { count: c.sales.length }) : t("noUnits")}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${c.phone}`}
              className="flex h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-4 text-[15px] font-semibold text-ink no-underline"
            >
              <Icon name="phone" size={18} strokeWidth={2} />
              {t("call")}
            </a>
            {canWrite && owing && (
              <Link
                href={projectHref(projectId, `sales/${owing.id}?collect=1`)}
                className="flex h-11 items-center gap-2 rounded-[10px] bg-brand px-4.5 text-[15px] font-semibold text-white no-underline hover:text-white"
              >
                <Icon name="banknote" size={18} strokeWidth={2} />
                {t("collect")}
              </Link>
            )}
          </div>
        </header>
      </div>

      <section aria-label={tc("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("bought")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(price)}</p>
          <p className="m-0 text-[13px] text-ink-3">{t("boughtSub", { count: c.sales.length, units: c.sales.map((s) => s.unitName).join(", ") || "—" })}</p>
        </article>
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("paid")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(paid)}</p>
          <div role="img" aria-label={t("paidAria", { percent: formatPercent(percent) })} className="flex items-center gap-2">
            <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
              <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, percent).toFixed(1)}%` }} />
            </span>
            <span className="text-[13px] text-ink-3">{formatPercent(percent)}</span>
          </div>
        </article>
        <article className={cn(card, "border-gold-line bg-gold-wash")}>
          <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(due)}</p>
          <p className="m-0 text-[13px] text-ink-2">{next ? t("dueNext", { date: day(next.date), amount: formatAmount(next.amount) }) : t("dueNone")}</p>
        </article>
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("onTime")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">
            {done.length - lateRows.length} / {done.length}
          </p>
          <p className="m-0 text-[13px] text-ink-3">{lateRows.length ? t("onTimeSub", { late: lateRows.length, days: avgLate }) : t("onTimeAll")}</p>
        </article>
      </section>

      <div className="grid grid-cols-1 items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_344px]">
        <div className="flex flex-col gap-5.5">
          <section aria-labelledby="pu-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-2 px-5 py-3.5">
              <h2 id="pu-title" className="m-0 text-[17px] font-semibold">
                {t("unitsTitle")}
              </h2>
              <span className="text-[13px] text-ink-3">{t("unitsNote")}</span>
            </div>
            {c.sales.map((s) => {
              const look = STATUS_LOOK[s.standing.status];
              return (
                <div key={s.id} className="flex flex-col gap-3 border-b border-line-3 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <Icon name="building" size={20} strokeWidth={2} />
                    </span>
                    <div className="flex min-w-0 grow flex-col">
                      <span className="flex items-center gap-2">
                        <strong className="text-base font-bold">{s.unitName}</strong>
                        <span className={cn("rounded-full px-2 text-xs font-bold", look.pill)}>{tu(`status.${s.standing.status}`)}</span>
                      </span>
                      <span className="text-[13px] text-ink-3">
                        {[
                          tu("floor", { floor: floorShort(locale, s.floor) }),
                          s.size ? `${s.size} sqft` : null,
                          t("sold", { date: day(s.date) }),
                          s.listPrice > s.price ? t("less", { list: formatAmount(s.listPrice), amount: formatAmount(s.listPrice - s.price) }) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                    <span className="flex flex-col items-end">
                      <span className="text-xs text-ink-3">{t("price")}</span>
                      <strong className="text-lg font-bold">৳ {formatAmount(s.price)}</strong>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {t("paidLine")} <strong className="text-success">৳ {formatAmount(s.standing.received)}</strong>
                    </span>
                    <span>
                      {t("dueLine")} <strong className="text-gold-ink">৳ {formatAmount(Math.max(0, s.standing.due))}</strong>
                    </span>
                  </div>
                  {s.installments > 0 && (
                    <div aria-hidden="true" className="flex gap-0.5">
                      {(s.rows ?? []).map((r) => (
                        <span
                          key={r.no}
                          className={cn(
                            "h-2 grow rounded-[2px]",
                            r.paid >= r.amount ? "bg-brand-mid" : s.standing.late && r.no === s.standing.late.no ? "bg-danger-strong" : "bg-line-2",
                          )}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-ink-2">
                    <span>
                      {s.installments
                        ? t("plan", { down: formatAmount(s.down), paid: s.standing.paidCount, count: s.installments, amount: formatAmount(s.installment) })
                        : t("planFull")}
                    </span>
                    <Link href={projectHref(projectId, `sales/${s.id}`)} className="flex items-center gap-1 font-semibold">
                      {t("saleLink")}
                      <Icon name="chevronRight" size={14} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              );
            })}
            {c.sales.length === 0 && <p className="m-0 p-5 text-sm text-ink-3">{t("noUnits")}</p>}
          </section>

          <section aria-labelledby="py-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-2 px-5 py-3.5">
              <h2 id="py-title" className="m-0 text-[17px] font-semibold">
                {t("paysTitle")}
              </h2>
              <span className="text-[13px] text-ink-3">{t("paysNote")}</span>
            </div>
            <div role="table" aria-labelledby="py-title" className="overflow-x-auto">
              {payments.map((p) => (
                <div
                  key={p.id}
                  role="row"
                  className="grid min-h-13 grid-cols-[92px_minmax(0,1fr)_120px_110px_40px] items-center gap-x-3 border-b border-line-3 px-5 lg:grid-cols-[96px_minmax(0,1fr)_150px_130px_120px_40px]"
                >
                  <span role="cell" className="text-sm text-ink-2">
                    {day(p.date)}
                  </span>
                  <span role="cell" className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-semibold">{p.kind === "DOWN" ? t("down") : t("installment")}</span>
                    <span className="text-xs text-ink-3">{p.unitName}</span>
                  </span>
                  <span role="cell" className="text-sm text-ink-2">
                    {p.account}
                  </span>
                  <span role="cell" className="hidden text-sm text-ink-2 lg:block">
                    {p.takenBy}
                  </span>
                  <span role="cell" className="text-right text-[15px] font-semibold text-success">
                    ৳ {formatAmount(p.amount)}
                  </span>
                  <span role="cell" className="flex justify-end">
                    <Link
                      href={saleReceiptHref(projectId, p.id)}
                      aria-label={t("receipt", { no: p.receiptNo })}
                      title={t("receipt", { no: p.receiptNo })}
                      className="flex size-8.5 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
                    >
                      <Icon name="receipt" size={16} strokeWidth={2} />
                    </Link>
                  </span>
                </div>
              ))}
              {payments.length === 0 && <p className="m-0 p-5 text-sm text-ink-3">{t("noPays")}</p>}
              <div role="row" className="flex justify-between bg-surface-2 px-5 py-3 text-sm font-bold">
                <span role="cell">
                  {t("total")} · {t("paysTotal", { count: payments.length })}
                </span>
                <span role="cell" className="text-success">
                  ৳ {formatAmount(payments.reduce((n, p) => n + p.amount, 0))}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4.5">
          <section aria-labelledby="in-title" className="flex flex-col gap-3 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
            <h2 id="in-title" className="m-0 text-base font-semibold">
              {t("infoTitle")}
            </h2>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-ink-3">{t("mobile")}</dt>
              <dd className="m-0 text-right">
                <a href={`tel:${c.phone}`} className="font-semibold">
                  {displayPhone(c.phone)}
                </a>
              </dd>
              <dt className="text-ink-3">{t("alt")}</dt>
              <dd className="m-0 text-right">{c.altPhone ? displayPhone(c.altPhone) : "—"}</dd>
              <dt className="text-ink-3">{t("nid")}</dt>
              <dd className="m-0 text-right">{c.nid ?? "—"}</dd>
              <dt className="text-ink-3">{t("address")}</dt>
              <dd className="m-0 text-right">{c.address ?? "—"}</dd>
              <dt className="text-ink-3">{t("addedBy")}</dt>
              <dd className="m-0 text-right">
                {c.addedBy} · {day(c.createdAt)}
              </dd>
            </dl>
          </section>
          <section aria-labelledby="nt-title" className="flex flex-col gap-2 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
            <h2 id="nt-title" className="m-0 text-base font-semibold">
              {t("noteTitle")}
            </h2>
            <p className={cn("m-0 text-sm leading-[1.6]", c.note ? "text-ink" : "text-ink-3")}>{c.note ?? t("noNote")}</p>
          </section>
        </div>
      </div>
    </>
  );
}
