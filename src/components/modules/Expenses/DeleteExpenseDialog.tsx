"use client";

import { useTranslations } from "next-intl";
import { AlertDialog } from "radix-ui";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst, expenseLines } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import type { IExpense } from "@/types/books.types";

// Where each total stands now, so the dialog can show it before → after.
export type BookTotals = {
  partyDue: Record<string, number>;
  categoryTotal: Record<string, number>;
  phaseSpent: Record<string, number>;
  accountBalance: Record<string, number>;
  projectSpent: number;
};

type DeleteExpenseDialogProps = {
  expense: IExpense | null;
  totals: BookTotals;
  pending: boolean;
  onClose: () => void;
  onConfirm: (expense: IExpense, reason: string) => void;
};

type Effect = { label: string; before: number; after: number; tone: "plain" | "good" };

// "এই খরচ মুছবেন?" with every total the deletion moves (boards ExpenseDelete, ExpenseEdit).
export function DeleteExpenseDialog({ expense, totals, pending, onClose, onConfirm }: DeleteExpenseDialogProps) {
  const t = useTranslations("Expenses.delete");
  const tFilters = useTranslations("Expenses.filters");
  const [reason, setReason] = useState("");
  if (!expense) return null;

  const { title, sub } = expenseLines(expense);
  const partyId = expense.supplierId ?? expense.contractorId;
  const taka = (n: number) => (n < 0 ? t("advance", { amount: formatAmount(-n) }) : `৳ ${formatAmount(n)}`);
  const effects: Effect[] = [];
  if (partyId && expense.partyName && !expense.paidNow) {
    const before = totals.partyDue[partyId] ?? 0;
    effects.push({ label: t("partyDue", { party: expense.partyName }), before, after: before - expense.amount, tone: "good" });
  }
  if (expense.paidNow && expense.paidAccount) {
    const before = totals.accountBalance[expense.paidAccount] ?? 0;
    effects.push({ label: t("account", { account: expense.paidAccount }), before, after: before + expense.amount, tone: "good" });
  }
  const categoryBefore = totals.categoryTotal[expense.categoryName] ?? expense.amount;
  effects.push({ label: t("category", { category: expense.categoryName }), before: categoryBefore, after: categoryBefore - expense.amount, tone: "plain" });
  if (expense.phaseId && expense.phaseName) {
    const before = totals.phaseSpent[expense.phaseId] ?? expense.amount;
    effects.push({ label: t("phase", { phase: expense.phaseName }), before, after: before - expense.amount, tone: "plain" });
  }
  effects.push({ label: t("project"), before: totals.projectSpent, after: totals.projectSpent - expense.amount, tone: "plain" });
  const meta = [dayFirst(expense.date), expense.categoryName, expense.phaseName, expense.partyName, tFilters(expense.paidNow ? "cash" : "credit")]
    .filter(Boolean)
    .join(" · ");

  return (
    <AlertDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <AlertDialog.Content className="fixed top-22.5 left-1/2 z-50 flex max-h-[calc(100vh-7rem)] w-[calc(100%-2rem)] max-w-145 -translate-x-1/2 flex-col overflow-hidden rounded-[20px] bg-white text-ink shadow-dialog">
          <div className="flex items-start gap-3.5 px-6 pt-5 pb-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger">
              <Icon name="trash" size={21} strokeWidth={2} />
            </span>
            <div className="flex grow flex-col gap-0.5">
              <AlertDialog.Title className="m-0 text-xl leading-[1.4] font-semibold">{t("title")}</AlertDialog.Title>
              <AlertDialog.Description className="m-0 text-sm text-ink-2">{t("subtitle")}</AlertDialog.Description>
            </div>
            <AlertDialog.Cancel
              aria-label={t("close")}
              className="-mt-1.5 -mr-2 flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-2"
            >
              <Icon name="x" size={20} strokeWidth={2} />
            </AlertDialog.Cancel>
          </div>

          <div className="flex flex-col gap-3.5 overflow-y-auto px-6 pb-4.5 sm:pl-20.5">
            <div className="flex items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
              <span className="flex min-w-0 grow flex-col">
                <strong className="text-base font-bold">{sub ? `${title} — ${sub}` : title}</strong>
                <span className="text-[13px] text-ink-3">{meta}</span>
              </span>
              <strong className="text-xl font-bold whitespace-nowrap">৳ {formatAmount(expense.amount)}</strong>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t("effectsTitle")}</span>
              {effects.map((effect) => (
                <div key={effect.label} className="grid grid-cols-[minmax(0,1fr)_auto_14px_auto] items-center gap-2 text-sm">
                  <span className="text-ink-2">{effect.label}</span>
                  <span className="whitespace-nowrap text-ink-3">{taka(effect.before)}</span>
                  <span aria-hidden="true" className="text-ink-3">
                    →
                  </span>
                  <strong
                    className={
                      effect.tone === "good"
                        ? effect.after < 0
                          ? "font-bold whitespace-nowrap text-info"
                          : "font-bold whitespace-nowrap text-success"
                        : "font-bold whitespace-nowrap"
                    }
                  >
                    {taka(effect.after)}
                  </strong>
                </div>
              ))}
            </div>

            {expense.paidOnBill > 0 && expense.partyName && (
              <p className="m-0 flex items-start gap-2 rounded-lg border border-gold-line bg-gold-wash px-3 py-2.5 text-[13px] leading-[1.55] text-gold-deep">
                <Icon name="alertTriangle" size={16} strokeWidth={2} className="mt-0.5" />
                <span>{t("paidWarning", { amount: formatAmount(expense.paidOnBill), party: expense.partyName })}</span>
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="del-reason" className="text-sm font-semibold">
                {t("reason")} <span className="font-normal text-ink-3">{t("reasonNote")}</span>
              </label>
              <input
                id="del-reason"
                type="text"
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("reasonPlaceholder")}
                className="box-border h-10.5 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
              />
            </div>
            <p className="m-0 text-xs leading-[1.55] text-ink-3">{t("footnote")}</p>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-line-3 bg-surface-3 px-6 py-3.5">
            <AlertDialog.Cancel className="h-11 cursor-pointer rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink">
              {t("cancel")}
            </AlertDialog.Cancel>
            <button
              type="button"
              disabled={pending}
              aria-busy={pending}
              onClick={() => onConfirm(expense, reason)}
              className="h-11 cursor-pointer rounded-lg border-none bg-danger-strong px-4.5 text-[15px] font-semibold text-white disabled:cursor-wait disabled:opacity-80"
            >
              {t("confirm")}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
