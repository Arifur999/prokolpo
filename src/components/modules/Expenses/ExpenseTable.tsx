"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteExpenseAction, restoreExpenseAction } from "@/app/(dashboardLayout)/projects/[projectId]/expenses/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst, expenseLines } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IExpense } from "@/types/books.types";
import { DeleteExpenseDialog, type BookTotals } from "./DeleteExpenseDialog";
import { ExpensePager } from "./ExpensePager";

type ExpenseTableProps = {
  projectId: string;
  rows: IExpense[];
  totals: BookTotals;
  filtered: boolean;
  page: number;
  pageSize: number;
  total: number;
  canWrite: boolean;
};

const GRID = "lg:grid-cols-[104px_minmax(0,1fr)_132px_92px_176px_112px_116px_36px_84px]";
const UNDO_MS = 6000;

// The expense rows with edit and delete, the page total and the pager (board ExpenseList).
export function ExpenseTable({ projectId, rows, totals, filtered, page, pageSize, total, canWrite }: ExpenseTableProps) {
  const t = useTranslations("Expenses");
  const router = useRouter();
  const pathname = usePathname();
  const [deleting, setDeleting] = useState<IExpense | null>(null);
  const [isPending, startTransition] = useTransition();
  const pageTotal = rows.reduce((sum, row) => sum + row.amount, 0);

  const undo = (expense: IExpense) =>
    startTransition(async () => {
      const result = await restoreExpenseAction(projectId, expense.id);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("delete.restored"));
      router.refresh();
    });

  const remove = (expense: IExpense, reason: string) =>
    startTransition(async () => {
      const result = await deleteExpenseAction(projectId, expense.id, reason);
      if (!result.success) return void toast.error(result.message);
      setDeleting(null);
      const { title } = expenseLines(expense);
      toast(t("delete.done", { title, date: dayFirst(expense.date) }), {
        duration: UNDO_MS,
        action: { label: t("delete.undo"), onClick: () => undo(expense) },
        classNames: {
          toast: "flex w-full items-center gap-3 rounded-xl bg-ink py-3 pr-3 pl-3.5 font-sans text-[15px] font-semibold text-white shadow-pop",
          actionButton: "ml-auto! h-8.5! rounded-lg! border! border-white/40! bg-transparent! px-3! text-sm! font-bold! text-gold-light!",
        },
      });
      router.refresh();
    });

  return (
    <>
      <div role="table" aria-label={t("table.label")} className="flex grow flex-col">
        <div
          role="row"
          className={cn("hidden h-11 items-center border-b border-line-2 bg-surface-2 pr-3 pl-5 text-[13px] font-semibold text-ink-2 lg:grid", GRID)}
        >
          <span role="columnheader">{t("table.date")}</span>
          <span role="columnheader">{t("table.description")}</span>
          <span role="columnheader">{t("table.category")}</span>
          <span role="columnheader">{t("table.phase")}</span>
          <span role="columnheader">{t("table.party")}</span>
          <span role="columnheader">{t("table.bought")}</span>
          <span role="columnheader" className="pr-2 text-right">
            {t("table.amount")}
          </span>
          <span role="columnheader" className="flex justify-center">
            <span className="sr-only">{t("table.memo")}</span>
            <Icon name="image" size={15} strokeWidth={2} />
          </span>
          <span role="columnheader">
            <span className="sr-only">{t("table.actions")}</span>
          </span>
        </div>

        {rows.map((row) => {
          const { title, sub } = expenseLines(row);
          const date = dayFirst(row.date);
          return (
            <div
              key={row.id}
              role="row"
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line-3 px-4 py-3 text-sm hover:bg-surface-3 lg:min-h-15.5 lg:gap-0 lg:py-0 lg:pr-3 lg:pl-5",
                GRID,
              )}
            >
              <span role="cell" className="order-3 text-[13px] whitespace-nowrap text-ink-2 lg:order-none lg:text-sm">
                {date}
              </span>
              <span role="cell" className="order-1 flex min-w-0 flex-col lg:order-none lg:pr-3">
                <span className="truncate text-[15px] font-medium">{title}</span>
                {sub && <span className="truncate text-[13px] text-ink-3">{sub}</span>}
              </span>
              <span role="cell" className="hidden lg:block">
                <span className="inline-block max-w-30 truncate rounded-full bg-surface-4 px-2.25 py-px align-middle text-[13px] font-medium text-ink-2">
                  {row.categoryName}
                </span>
              </span>
              <span role="cell" className="hidden text-ink-2 lg:block">
                {row.phaseName ?? t("none")}
              </span>
              <span role="cell" className="hidden truncate pr-2 lg:block">
                {row.partyName ?? t("none")}
              </span>
              <span role="cell" className="order-4 justify-self-end lg:order-none lg:justify-self-start">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.25 py-px text-[13px] font-semibold",
                    row.paidNow ? "bg-brand-tint text-success" : "bg-gold-tint text-gold-ink",
                  )}
                >
                  <span aria-hidden="true" className={cn("size-1.5 rounded-full", row.paidNow ? "bg-brand-mid" : "bg-gold-strong")} />
                  {t(row.paidNow ? "filters.cash" : "filters.credit")}
                </span>
              </span>
              <span role="cell" className="order-2 text-right text-[15px] font-semibold whitespace-nowrap lg:order-none lg:pr-2">
                {formatAmount(row.amount)}
              </span>
              <span role="cell" className="hidden justify-center text-ink-2 lg:flex">
                {row.hasMemo ? <Icon name="image" size={16} strokeWidth={2} label={t("table.hasMemo")} /> : <span className="text-ink-disabled">—</span>}
              </span>
              <span role="cell" className="order-5 col-span-2 flex justify-end gap-1 lg:order-none lg:col-span-1">
                {canWrite && (
                  <>
                    <Link
                      href={projectHref(projectId, `expenses/${row.id}`)}
                      aria-label={t("table.editLabel", { title, date })}
                      title={t("table.edit")}
                      className="flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-4"
                    >
                      <Icon name="pencil" size={17} strokeWidth={2} />
                    </Link>
                    <button
                      type="button"
                      aria-label={t("table.deleteLabel", { title, date })}
                      title={t("table.delete")}
                      onClick={() => setDeleting(row)}
                      className="flex size-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-danger hover:bg-danger-tint"
                    >
                      <Icon name="trash" size={17} strokeWidth={2} />
                    </button>
                  </>
                )}
              </span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <span className="text-[17px] font-semibold">{filtered ? t("emptyTitle") : t("noneYetTitle")}</span>
            <span className="text-sm text-ink-3">{filtered ? t("emptyBody") : t("noneYetBody")}</span>
            {filtered && (
              <button
                type="button"
                onClick={() => router.replace(pathname)}
                className="mt-2 h-10 cursor-pointer rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-2 bg-surface-2 px-5 py-3.5">
        <span className="text-sm text-ink-2">
          {filtered ? t("filteredTotal", { count: total }) : t("pageTotal")}{" "}
          <strong className="text-base font-bold text-ink">৳ {formatAmount(pageTotal)}</strong>
        </span>
        <ExpensePager page={page} pageSize={pageSize} total={total} />
      </div>

      <DeleteExpenseDialog key={deleting?.id} expense={deleting} totals={totals} pending={isPending} onClose={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}
