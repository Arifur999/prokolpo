"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { PayAccount } from "@/components/shared/PayDialog";
import { Segmented } from "@/components/shared/Segmented";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ISupplier } from "@/types/books.types";
import { SupplierFormDialog } from "./SupplierFormDialog";
import { SupplierPayDialog } from "./SupplierPayDialog";
import { daysOwed, sortSuppliers, type SupplierSort } from "./supplierRules";

type SupplierListProps = {
  projectId: string;
  suppliers: ISupplier[];
  accounts: PayAccount[];
  today: string;
  canWrite: boolean;
};

const GRID = "lg:grid-cols-[minmax(0,1fr)_150px_124px_124px_150px_112px_164px]";
const TONES = ["bg-brand-tint text-brand", "bg-gold-tint text-gold-ink", "bg-surface-4 text-ink-2"];
// A due older than this gets the red "N দিন ধরে বাকি" under the last date.
const STALE_DAYS = 21;

type Filter = "all" | "due" | "clear";

// The supplier table with search, due filter and sort, plus the add and pay dialogs
// (boards SupplierList, SupplierAdd, SupplierPay). ?new=1 opens the add dialog.
export function SupplierList({ projectId, suppliers, accounts, today, canWrite }: SupplierListProps) {
  const t = useTranslations("Suppliers");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SupplierSort>("due");
  const [paying, setPaying] = useState<ISupplier | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const adding = params.get("new") === "1";
  const setAdding = (open: boolean) => router.replace(open ? `${pathname}?new=1` : pathname, { scroll: false });

  const needle = query.trim().toLocaleLowerCase();
  const matches = (s: ISupplier) => !needle || [s.name, s.phone ?? "", ...s.supplies].some((text) => text.toLocaleLowerCase().includes(needle));
  const inFilter = (s: ISupplier) => filter === "all" || (filter === "due" ? s.due > 0 : s.due <= 0);
  const rows = sortSuppliers(
    suppliers.filter((s) => matches(s) && inFilter(s)),
    sort,
    added,
  );
  const sum = (key: "billed" | "paid" | "due") => rows.reduce((total, s) => total + s[key], 0);

  return (
    <section aria-label={t("listLabel")} className="flex grow flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line-2 px-4 py-4 lg:px-5">
        <div className="relative w-full sm:w-70">
          <label htmlFor="sp-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <span className="pointer-events-none absolute top-2.75 left-3 flex text-ink-3">
            <Icon name="search" size={18} strokeWidth={2} />
          </span>
          <input
            id="sp-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            className="box-border h-10 w-full rounded-lg border border-line bg-white pr-3 pl-9.5 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
          />
        </div>
        <Segmented
          label={t("filterLabel")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("all"), count: suppliers.length },
            { value: "due", label: t("withDue"), count: suppliers.filter((s) => s.due > 0).length },
            { value: "clear", label: t("noDue"), count: suppliers.filter((s) => s.due <= 0).length },
          ]}
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <label htmlFor="sp-sort" className="text-sm text-ink-2">
            {t("sortLabel")}
          </label>
          <div className="relative">
            <select
              id="sp-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SupplierSort)}
              className="box-border h-10 cursor-pointer appearance-none rounded-lg border border-line bg-white pr-8.5 pl-3 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="due">{t("sortDue")}</option>
              <option value="recent">{t("sortRecent")}</option>
              <option value="billed">{t("sortBilled")}</option>
              <option value="name">{t("sortName")}</option>
            </select>
            <Icon name="chevronDown" size={16} strokeWidth={2} className="pointer-events-none absolute top-3 right-2.5 text-ink-3" />
          </div>
        </div>
      </div>

      <div role="table" aria-label={t("table.label")} className="flex grow flex-col">
        <div role="row" className={cn("hidden h-11 items-center border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2 lg:grid", GRID)}>
          <span role="columnheader">{t("table.supplier")}</span>
          <span role="columnheader">{t("table.supplies")}</span>
          <span role="columnheader" className="pr-4 text-right">
            {t("table.billed")}
          </span>
          <span role="columnheader" className="pr-4 text-right">
            {t("table.paid")}
          </span>
          <span role="columnheader" className="pr-4 text-right">
            {t("table.due")}
          </span>
          <span role="columnheader">{t("table.last")}</span>
          <span role="columnheader">
            <span className="sr-only">{t("table.actions")}</span>
          </span>
        </div>

        {rows.map((s) => {
          const href = projectHref(projectId, `suppliers/${s.id}`);
          const percent = s.billed ? Math.round((s.paid / s.billed) * 100) : 0;
          const owedDays = daysOwed(s, today);
          return (
            <div
              key={s.id}
              role="row"
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-line-3 px-4 py-3 text-sm lg:min-h-16 lg:gap-0 lg:px-5 lg:py-0",
                GRID,
                s.id === added && "bg-brand-wash",
              )}
            >
              <span role="cell" className="flex min-w-0 items-center gap-3 lg:pr-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9.5 shrink-0 items-center justify-center rounded-[10px] text-[15px] font-bold",
                    TONES[Array.from(s.name).length % 3],
                  )}
                >
                  {Array.from(s.name)[0]}
                </span>
                <span className="flex min-w-0 flex-col">
                  <Link href={href} className="truncate text-[15px] font-semibold text-ink no-underline hover:text-ink hover:underline">
                    {s.name}
                  </Link>
                  {s.phone && <span className="text-[13px] text-ink-3">{displayPhone(s.phone)}</span>}
                </span>
              </span>
              <span role="cell" className="hidden flex-wrap gap-1 pr-2 lg:flex">
                {s.supplies.map((kind) => (
                  <span key={kind} className="rounded-full bg-surface-4 px-2 text-[13px] whitespace-nowrap text-ink-2">
                    {kind}
                  </span>
                ))}
              </span>
              <span role="cell" className="hidden pr-4 text-right text-ink-2 lg:block">
                {s.billed ? formatAmount(s.billed) : "—"}
              </span>
              <span role="cell" className="hidden pr-4 text-right text-ink-2 lg:block">
                {s.paid ? formatAmount(s.paid) : "—"}
              </span>
              <span role="cell" className="flex flex-col items-end lg:pr-4">
                {s.due > 0 ? (
                  <>
                    <span className="text-base font-bold">{formatAmount(s.due)}</span>
                    <span className="flex items-center gap-1.5 text-xs text-ink-3">
                      <span className="h-1 w-11 overflow-hidden rounded-full bg-line-3">
                        <span className="block h-full bg-brand-mid" style={{ width: `${percent}%` }} />
                      </span>
                      {t("paidPercent", { percent })}
                    </span>
                  </>
                ) : s.due < 0 ? (
                  <span className="text-[13px] font-semibold text-info">{t("advance", { amount: formatAmount(-s.due) })}</span>
                ) : s.billed > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.25 py-px text-[13px] font-semibold text-success">
                    <Icon name="check" size={13} strokeWidth={2.6} />
                    {t("settled")}
                  </span>
                ) : (
                  <span className="text-[13px] text-ink-3">{t("noActivity")}</span>
                )}
              </span>
              <span role="cell" className="flex flex-col text-[13px] lg:text-sm">
                <span className="text-ink-2">{s.lastDate ? dayFirst(s.lastDate.slice(0, 10)) : "—"}</span>
                {owedDays >= STALE_DAYS && <span className="text-xs font-semibold text-danger">{t("dueFor", { days: owedDays })}</span>}
              </span>
              <span role="cell" className="flex items-center justify-end gap-1.5">
                {canWrite && s.due > 0 && (
                  <button
                    type="button"
                    aria-label={t("payLabel", { name: s.name })}
                    onClick={() => setPaying(s)}
                    className="h-9 cursor-pointer rounded-[9px] border border-brand bg-white px-3 text-sm font-semibold whitespace-nowrap text-brand"
                  >
                    {t("pay")}
                  </button>
                )}
                <Link
                  href={href}
                  aria-label={t("ledgerLabel", { name: s.name })}
                  className="flex size-9 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
                >
                  <Icon name="receipt" size={17} />
                </Link>
              </span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="text-[17px] font-semibold">{suppliers.length ? t("emptyTitle") : t("noneYetTitle")}</span>
            <span className="text-sm text-ink-3">{suppliers.length ? t("emptyBody") : t("noneYetBody")}</span>
            {suppliers.length > 0 && (
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
          <span className="hidden pr-4 text-right font-semibold lg:block">{formatAmount(sum("billed"))}</span>
          <span className="hidden pr-4 text-right font-semibold lg:block">{formatAmount(sum("paid"))}</span>
          <span className="text-right text-base font-bold lg:pr-4">{formatAmount(sum("due"))}</span>
        </div>
      )}

      {adding && <SupplierFormDialog projectId={projectId} onClose={() => setAdding(false)} onAdded={setAdded} />}
      {paying && <SupplierPayDialog projectId={projectId} supplier={paying} accounts={accounts} onClose={() => setPaying(null)} />}
    </section>
  );
}
