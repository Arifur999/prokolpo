"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { PayAccount } from "@/components/shared/PayDialog";
import { Segmented } from "@/components/shared/Segmented";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ContractorStatus, IContractor, PayType } from "@/types/books.types";
import { ContractorFormDialog } from "./ContractorFormDialog";
import { ContractorPayDialog } from "./ContractorPayDialog";

type ContractorListProps = {
  projectId: string;
  contractors: IContractor[];
  accounts: PayAccount[];
  canWrite: boolean;
};

const GRID = "lg:grid-cols-[minmax(0,1fr)_118px_168px_128px_116px_150px_112px_150px]";
const STATUS: Record<ContractorStatus, { dot: string; ink: string }> = {
  WORKING: { dot: "bg-brand-mid", ink: "text-success" },
  NOT_STARTED: { dot: "bg-gold-strong", ink: "text-gold-ink" },
  DONE: { dot: "bg-ink-5", ink: "text-ink-2" },
};

type Filter = "all" | PayType;

// The contractor table: contracts and daily teams side by side, what they earned, were
// paid and are owed (boards ContractorList, ContractorAdd, ContractorPay). ?new=1 opens add.
export function ContractorList({ projectId, contractors, accounts, canWrite }: ContractorListProps) {
  const t = useTranslations("Contractors");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [paying, setPaying] = useState<IContractor | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const adding = params.get("new") === "1";
  const setAdding = (open: boolean) => router.replace(open ? `${pathname}?new=1` : pathname, { scroll: false });

  const needle = query.trim().toLocaleLowerCase();
  const rows = contractors
    .filter(
      (c) =>
        (filter === "all" || c.payType === filter) && (!needle || [c.name, c.phone ?? "", c.work].some((text) => text.toLocaleLowerCase().includes(needle))),
    )
    .sort((a, b) => (a.id === added ? -1 : b.id === added ? 1 : 0));
  const sum = (key: "total" | "paid" | "due") => rows.reduce((total, c) => total + c[key], 0);

  return (
    <section aria-label={t("listLabel")} className="flex grow flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line-2 px-4 py-4 lg:px-5">
        <div className="relative w-full sm:w-70">
          <label htmlFor="ct-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <span className="pointer-events-none absolute top-2.75 left-3 flex text-ink-3">
            <Icon name="search" size={18} strokeWidth={2} />
          </span>
          <input
            id="ct-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            className="box-border h-10 w-full rounded-lg border border-line bg-white pr-3 pl-9.5 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
          />
        </div>
        <Segmented
          label={t("typeLabel")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("all"), count: contractors.length },
            { value: "CONTRACT", label: t("contract"), count: contractors.filter((c) => c.payType === "CONTRACT").length },
            { value: "DAILY", label: t("daily"), count: contractors.filter((c) => c.payType === "DAILY").length },
          ]}
        />
      </div>

      <div role="table" aria-label={t("table.label")} className="flex grow flex-col">
        <div role="row" className={cn("hidden h-11 items-center border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2 lg:grid", GRID)}>
          <span role="columnheader">{t("table.contractor")}</span>
          <span role="columnheader">{t("table.work")}</span>
          <span role="columnheader">{t("table.how")}</span>
          <span role="columnheader" className="pr-4 text-right">
            {t("table.total")}
          </span>
          <span role="columnheader" className="pr-4 text-right">
            {t("table.paid")}
          </span>
          <span role="columnheader" className="pr-4 text-right">
            {t("table.due")}
          </span>
          <span role="columnheader">{t("table.status")}</span>
          <span role="columnheader">
            <span className="sr-only">{t("table.actions")}</span>
          </span>
        </div>

        {rows.map((c) => {
          const daily = c.payType === "DAILY";
          const href = projectHref(projectId, `contractors/${c.id}`);
          const percent = c.total ? Math.round((c.paid / c.total) * 100) : 0;
          const detail = daily ? t("teamOf", { count: c.teamSize ?? 1 }) : c.scope;
          const totalNote = daily
            ? c.manDays
              ? t("manDays", { days: c.manDays })
              : null
            : c.extras
              ? t("contractPlusExtra", { contract: formatAmount(c.contractAmount ?? 0), extra: formatAmount(c.extras) })
              : null;
          return (
            <div
              key={c.id}
              role="row"
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-line-3 px-4 py-3 text-sm lg:min-h-16.5 lg:gap-0 lg:px-5 lg:py-0",
                GRID,
                c.id === added && "bg-brand-wash",
              )}
            >
              <span role="cell" className="flex min-w-0 items-center gap-3 lg:pr-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9.5 shrink-0 items-center justify-center rounded-full text-[15px] font-bold",
                    daily ? "bg-gold-tint text-gold-ink" : "bg-brand-tint text-brand",
                  )}
                >
                  {Array.from(c.name)[0]}
                </span>
                <span className="flex min-w-0 flex-col">
                  <Link href={href} className="truncate text-[15px] font-semibold text-ink no-underline hover:text-ink hover:underline">
                    {c.name}
                  </Link>
                  <span className="truncate text-[13px] text-ink-3">{[c.phone && displayPhone(c.phone), detail].filter(Boolean).join(" · ")}</span>
                </span>
              </span>
              <span role="cell" className="hidden lg:block">
                <span className="rounded-full bg-surface-4 px-2.25 py-px text-[13px] font-medium whitespace-nowrap text-ink-2">{c.work}</span>
              </span>
              <span role="cell" className="hidden flex-col lg:flex">
                <span
                  className={cn(
                    "inline-flex items-center self-start rounded-md px-2 text-[13px] font-semibold",
                    daily ? "bg-gold-tint text-gold-ink" : "bg-brand-tint text-success",
                  )}
                >
                  {t(daily ? "typeDAILY" : "typeCONTRACT")}
                </span>
                <span className="text-[13px] text-ink-3">
                  {daily
                    ? t("perDay", { amount: formatAmount(c.dailyWage ?? 0) })
                    : t(c.extras ? "contractExtra" : "contractSub", { amount: formatAmount(c.contractAmount ?? 0) })}
                </span>
              </span>
              <span role="cell" className="hidden flex-col items-end pr-4 lg:flex">
                <span>{c.total ? formatAmount(c.total) : "—"}</span>
                {totalNote && <span className="text-xs text-ink-3">{totalNote}</span>}
              </span>
              <span role="cell" className="hidden pr-4 text-right text-ink-2 lg:block">
                {formatAmount(c.paid)}
              </span>
              <span role="cell" className="flex flex-col items-end lg:pr-4">
                {c.due > 0 ? (
                  <>
                    <span className="text-base font-bold">{formatAmount(c.due)}</span>
                    <span className="flex items-center gap-1.5 text-xs text-ink-3">
                      <span className="h-1 w-11 overflow-hidden rounded-full bg-line-3">
                        <span className="block h-full bg-brand-mid" style={{ width: `${percent}%` }} />
                      </span>
                      {t("paidPercent", { percent })}
                    </span>
                  </>
                ) : c.due < 0 ? (
                  <span className="text-[13px] font-semibold text-info">{t("advance", { amount: formatAmount(-c.due) })}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.25 py-px text-[13px] font-semibold text-success">
                    <Icon name="check" size={13} strokeWidth={2.6} />
                    {t("settled")}
                  </span>
                )}
              </span>
              <span role="cell" className="hidden lg:block">
                <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", STATUS[c.status].ink)}>
                  <span aria-hidden="true" className={cn("size-1.75 rounded-full", STATUS[c.status].dot)} />
                  {t(`status.${c.status}`)}
                </span>
              </span>
              <span role="cell" className="col-span-2 flex items-center justify-end gap-1.5 lg:col-span-1">
                {daily && (
                  <Link
                    href={projectHref(projectId, "contractors/attendance")}
                    aria-label={t("attLabel", { name: c.name })}
                    className="box-border flex h-9 items-center rounded-[9px] border border-line bg-white px-2.5 text-sm font-semibold whitespace-nowrap text-ink no-underline hover:text-ink"
                  >
                    {t("attendanceShort")}
                  </Link>
                )}
                {canWrite && c.due > 0 && (
                  <button
                    type="button"
                    aria-label={t("payLabel", { name: c.name })}
                    onClick={() => setPaying(c)}
                    className="h-9 cursor-pointer rounded-[9px] border border-brand bg-white px-2.5 text-sm font-semibold whitespace-nowrap text-brand"
                  >
                    {t("payShort")}
                  </button>
                )}
                <Link
                  href={href}
                  aria-label={t("ledgerLabel", { name: c.name })}
                  className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
                >
                  <Icon name="receipt" size={17} />
                </Link>
              </span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="text-[17px] font-semibold">{contractors.length ? t("emptyTitle") : t("noneYetTitle")}</span>
            <span className="text-sm text-ink-3">{contractors.length ? t("emptyBody") : t("noneYetBody")}</span>
            {contractors.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
                className="mt-2 h-10 cursor-pointer rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink"
              >
                {t("showAll")}
              </button>
            )}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center border-t border-line-2 bg-surface-2 px-4 py-3.5 text-sm lg:px-5", GRID)}>
          <span className="font-semibold">{t("footer", { count: rows.length })}</span>
          <span className="hidden lg:block" />
          <span className="hidden lg:block" />
          <span className="hidden pr-4 text-right font-semibold lg:block">{formatAmount(sum("total"))}</span>
          <span className="hidden pr-4 text-right font-semibold lg:block">{formatAmount(sum("paid"))}</span>
          <span className="text-right text-base font-bold lg:pr-4">{formatAmount(sum("due"))}</span>
        </div>
      )}

      {adding && <ContractorFormDialog projectId={projectId} onClose={() => setAdding(false)} onAdded={setAdded} />}
      {paying && <ContractorPayDialog projectId={projectId} contractor={paying} accounts={accounts} onClose={() => setPaying(null)} />}
    </section>
  );
}
