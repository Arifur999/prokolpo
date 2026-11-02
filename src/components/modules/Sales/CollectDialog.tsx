"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { collectAction } from "@/app/(dashboardLayout)/projects/[projectId]/sales/_action";
import { AccountPicker, type PickableAccount } from "@/components/shared/form/AccountPicker";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { saleReceiptHref } from "@/lib/routes";
import { allocate, quickAmounts } from "@/lib/saleLook";
import { cn } from "@/lib/utils";
import type { ISale } from "@/types/sales.types";

type CollectDialogProps = { projectId: string; sale: ISale; accounts: PickableAccount[]; onClose: () => void };

const taka = (n: number) => `৳ ${formatAmount(n)}`;
const day = (iso: string) => dayFirst(iso.slice(0, 10));

// "কিস্তি জমা নিন" (board SaleCollect): how much, what it pays off (oldest first), into
// which account; the receipt can open straight after.
export function CollectDialog({ projectId, sale, accounts, onClose }: CollectDialogProps) {
  const t = useTranslations("Sales.collect");
  const router = useRouter();
  const rows = sale.rows ?? [];
  const st = sale.standing;
  const quick = quickAmounts(rows, st.due);
  const [amount, setAmount] = useState(String(quick.first || ""));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [print, setPrint] = useState(true);
  const [isPending, startTransition] = useTransition();

  const paying = Number(amount || 0);
  const over = paying > st.due;
  const alloc = over ? [] : allocate(rows, paying);
  const focus = st.late ?? st.next;
  const account = accounts.find((a) => a.id === accountId);
  const after = st.due - paying;
  const chips = [
    quick.first && { label: t("chipOne", { amount: formatAmount(quick.first) }), value: quick.first },
    quick.two && { label: t("chipTwo", { amount: formatAmount(quick.two) }), value: quick.two },
    { label: t("chipAll", { amount: formatAmount(quick.all) }), value: quick.all },
  ].filter((c, i, list): c is { label: string; value: number } => !!c && list.findIndex((x) => x && x.value === c.value) === i);

  const save = () => {
    if (!paying || over || !accountId) return;
    startTransition(async () => {
      const result = await collectAction(projectId, sale.id, { amount: paying, accountId, note: "" });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { name: sale.customer, amount: formatAmount(paying), receipt: result.data.receiptNo ?? "" }));
      onClose();
      if (print && result.data.paymentId) router.push(saleReceiptHref(projectId, result.data.paymentId));
      else router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title")}
      subtitle={`${sale.unitName} · ${sale.customer}`}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass="max-w-165"
      topClass="top-14"
      band={
        focus && (
          <div className={cn("flex items-center gap-3.5 border-b border-line-3 px-6 py-3", st.late ? "bg-danger-wash" : "bg-brand-wash")}>
            <span className="flex grow flex-col">
              <span className={cn("text-[13px] font-semibold", st.late ? "text-danger" : "text-brand")}>{st.late ? t("lateHead") : t("nextHead")}</span>
              <span className="text-[15px] font-semibold">
                {st.late
                  ? t("stripLate", { no: st.late.no, date: day(st.late.date), amount: formatAmount(st.late.amount), days: st.late.days })
                  : t("strip", { no: focus.no, date: day(focus.date), amount: formatAmount(focus.amount) })}
              </span>
            </span>
            <span className="flex flex-col items-end">
              <span className="text-[13px] text-ink-2">{t("totalDue")}</span>
              <span className="text-xl leading-[1.25] font-bold text-gold-ink">{taka(st.due)}</span>
            </span>
          </div>
        )
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={print} onChange={(event) => setPrint(event.target.checked)} className="m-0 size-4.5 accent-brand" />
            {t("print")}
          </label>
          <DialogButtons
            cancel={t("cancel")}
            submit={paying && !over ? t("submitAmount", { amount: formatAmount(paying) }) : t("submit")}
            onCancel={onClose}
            onSubmit={save}
            pending={isPending}
            disabled={!paying || over}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="pay-amount" className="text-[15px] font-semibold">
          {t("amount")} <span className="text-danger">*</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <MoneyInput
            id="pay-amount"
            autoFocus
            aria-required="true"
            aria-describedby="pay-help"
            placeholder="0"
            value={amount}
            onChange={setAmount}
            invalid={over}
            wrapperClassName={cn("h-14 w-60 shrink-0 gap-2.5 rounded-xl px-4", !over && "border-2 border-brand")}
            className="text-[22px] font-bold"
          />
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setAmount(String(c.value))}
                className={cn(
                  "h-8.5 cursor-pointer rounded-full px-3 text-[13px] font-semibold whitespace-nowrap text-ink",
                  paying === c.value ? "border-[1.5px] border-brand bg-brand-wash" : "border border-line bg-white",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <span id="pay-help" className="min-h-5 text-[13px] font-semibold text-danger">
          {over ? t("over", { amount: formatAmount(st.due) }) : ""}
        </span>
      </div>
      {alloc.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-line-2 px-3.5 py-3">
          <span className="text-sm font-semibold">
            {t("allocTitle")} <span className="font-normal text-ink-3">{t("allocNote")}</span>
          </span>
          {(alloc.length > 4 ? alloc.slice(0, 3) : alloc).map((a) => (
            <div key={a.no} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  a.full ? "bg-brand-tint text-success" : "bg-gold-tint text-gold-ink",
                )}
              >
                {a.full ? "✓" : "½"}
              </span>
              <span className="grow">{t("allocRow", { no: a.no, date: day(a.due) })}</span>
              <strong className={cn("font-semibold", a.full ? "text-success" : "text-gold-ink")}>
                {a.full ? t("allocFull", { amount: formatAmount(a.got) }) : t("allocPart", { amount: formatAmount(a.got), left: formatAmount(a.leftAfter) })}
              </strong>
            </div>
          ))}
          {alloc.length > 4 && (
            <div className="flex items-center gap-2 text-sm">
              <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-4 text-xs font-bold text-ink-2">
                …
              </span>
              <span className="grow">{t("allocMore", { count: alloc.length - 3 })}</span>
              <strong className="font-semibold text-success">{t("allocMoreText")}</strong>
            </div>
          )}
        </div>
      )}
      <AccountPicker name="pay-acc" label={t("account")} accounts={accounts} value={accountId} onChange={setAccountId} />
      <div className="flex flex-col gap-2 rounded-xl bg-surface-2 px-4 py-3.5">
        <div className="flex items-center gap-2.5 text-[15px]">
          <span className="grow font-semibold">{t("saleDue")}</span>
          <span className="text-ink-3">{taka(st.due)}</span>
          <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
          <strong className={cn("min-w-30 text-right font-bold", after <= 0 ? "text-success" : "text-ink")}>{after <= 0 ? t("settled") : taka(after)}</strong>
        </div>
        {account && (
          <div className="flex items-center gap-2.5 text-[15px]">
            <span className="grow font-semibold">{account.name}</span>
            <span className="text-ink-3">{taka(account.balance)}</span>
            <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
            <strong className="min-w-30 text-right font-bold text-success">{taka(account.balance + (over ? 0 : paying))}</strong>
          </div>
        )}
      </div>
    </FormDialog>
  );
}
