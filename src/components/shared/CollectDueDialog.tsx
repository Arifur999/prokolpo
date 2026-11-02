"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { AccountPicker, type PickableAccount } from "./form/AccountPicker";
import { MoneyInput } from "./form/MoneyInput";
import { DialogButtons, FormDialog } from "./FormDialog";
import { Icon } from "./icon/Icon";

type CollectDueDialogProps = {
  // The copy: both namespaces carry the same keys.
  namespace: "Produce.collect" | "Shop.collect";
  name: string;
  due: number;
  // Which account the money goes into; leave out when it always goes to cash.
  accounts?: PickableAccount[];
  save: (amount: number, accountId: string) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
  // A line under the figures, e.g. where the money goes.
  note?: string;
  widthClass?: string;
};

// "বাকি টাকা পেলেন" (boards FarmSales, BizSales): how much came in against what someone owes,
// into which account; it cannot go past the due.
export function CollectDueDialog({ namespace, name, due, accounts, save, onClose, note, widthClass = "max-w-130" }: CollectDueDialogProps) {
  const t = useTranslations(namespace);
  const router = useRouter();
  const [amount, setAmount] = useState(String(due));
  const [accountId, setAccountId] = useState(accounts?.[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const paying = Number(amount || 0);
  const over = paying > due;
  const after = due - paying;

  const submit = () => {
    if (!paying || over) return;
    startTransition(async () => {
      const result = await save(paying, accountId);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { name, amount: formatAmount(paying) }));
      onClose();
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("who", { name, amount: formatAmount(due) })}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass={widthClass}
      topClass="top-24"
      bodyClass="flex flex-col gap-3.5 px-6 py-4.5"
      footer={
        <DialogButtons
          cancel={t("cancel")}
          submit={paying && !over ? t("submitAmount", { amount: formatAmount(paying) }) : t("submit")}
          onCancel={onClose}
          onSubmit={submit}
          pending={isPending}
          disabled={!paying || over}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="camt" className="sr-only">
          {t("amount")}
        </label>
        <MoneyInput
          id="camt"
          autoFocus
          placeholder="0"
          value={amount}
          onChange={setAmount}
          invalid={over}
          wrapperClassName={cn("h-13.5 w-55 gap-2.5 rounded-xl px-3.5", !over && "border-2 border-brand")}
          className="text-[21px] font-bold"
        />
        <button
          type="button"
          onClick={() => setAmount(String(due))}
          className="h-8.5 cursor-pointer rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink"
        >
          {t("fill", { amount: formatAmount(due) })}
        </button>
      </div>
      <span className="min-h-4.5 text-[13px] font-semibold text-danger">{over ? t("over") : ""}</span>
      {accounts && <AccountPicker name="col-acc" label={t("account")} accounts={accounts} value={accountId} onChange={setAccountId} compact />}
      <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3 text-[15px]">
        <span className="grow font-semibold">{t("due")}</span>
        <span className="text-ink-3">৳ {formatAmount(due)}</span>
        <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
        <strong className={cn("font-bold", !over && after <= 0 ? "text-success" : "text-ink")}>
          {over ? "—" : after <= 0 ? t("settled") : `৳ ${formatAmount(after)}`}
        </strong>
      </div>
      {note && <span className="text-xs text-ink-3">{note}</span>}
    </FormDialog>
  );
}
