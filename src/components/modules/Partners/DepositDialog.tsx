"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { depositAction } from "@/app/(dashboardLayout)/projects/[projectId]/partners/_action";
import { AccountPicker, type PickableAccount } from "@/components/shared/form/AccountPicker";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { dueOf, owedBy, percentText } from "@/lib/partnerMath";
import { partnerReceiptHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ICapitalCall, IPartner } from "@/types/partners.types";
import { PartnerAvatar } from "./PartnerAvatar";

type DepositDialogProps = {
  projectId: string;
  partner: IPartner;
  calls: ICapitalCall[];
  accounts: PickableAccount[];
  onClose: () => void;
};

const taka = (n: number) => `৳ ${formatAmount(n)}`;

// "পার্টনারের টাকা জমা নিন" (board PartnerList): how much, for what, into which account, and
// what the partner and the account show after. The receipt can open straight after.
export function DepositDialog({ projectId, partner: p, calls, accounts, onClose }: DepositDialogProps) {
  const t = useTranslations("Partners.deposit");
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [callId, setCallId] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [print, setPrint] = useState(true);
  const [isPending, startTransition] = useTransition();

  const paying = Number(amount || 0);
  const due = dueOf(p);
  const after = due - paying;
  const account = accounts.find((a) => a.id === accountId);
  const options = [
    { id: "", label: t("forMain") },
    ...calls.map((c) => ({ id: c.id, label: t("forCall", { date: dayFirst(c.date.slice(0, 10)).slice(0, 5) }) })),
  ];

  const save = () => {
    if (!paying || !accountId) return;
    startTransition(async () => {
      const result = await depositAction(projectId, p.id, { amount: paying, accountId, callId, note: "" });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { name: p.name, amount: formatAmount(paying), receipt: result.data.receiptNo }));
      onClose();
      if (print) router.push(partnerReceiptHref(projectId, result.data.id));
      else router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title")}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass="max-w-160"
      topClass="top-14"
      band={
        <div className="flex items-center gap-3.5 border-b border-line-3 bg-surface-2 px-6 py-3.5">
          <PartnerAvatar name={p.name} color={p.color} size="md" />
          <span className="flex min-w-0 flex-col">
            <span className="text-base font-semibold">{p.name}</span>
            <span className="text-[13px] text-ink-3">
              {t("sub", { share: percentText(p.share), should: formatAmount(owedBy(p)), paid: formatAmount(p.paid) })}
            </span>
          </span>
          <span className="ml-auto flex flex-col items-end">
            <span className="text-[13px] text-ink-2">{t("nowDue")}</span>
            <span className="text-[22px] leading-[1.25] font-bold text-gold-ink">{taka(Math.max(0, due))}</span>
          </span>
        </div>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={print} onChange={(event) => setPrint(event.target.checked)} className="m-0 size-4.5 accent-brand" />
            {t("print")}
          </label>
          <DialogButtons
            cancel={t("cancel")}
            submit={paying ? t("submitAmount", { amount: formatAmount(paying) }) : t("submit")}
            onCancel={onClose}
            onSubmit={save}
            pending={isPending}
            disabled={!paying}
          />
        </div>
      }
    >
      <div className="flex flex-wrap items-end gap-3.5">
        <div className="flex flex-col gap-2">
          <label htmlFor="cb-amount" className="text-[15px] font-semibold">
            {t("amount")} <span className="text-danger">*</span>
          </label>
          <MoneyInput
            id="cb-amount"
            autoFocus
            aria-required="true"
            placeholder="0"
            value={amount}
            onChange={setAmount}
            wrapperClassName="h-14 w-62.5 gap-2.5 rounded-xl border-2 border-brand px-4"
            className="text-[22px] font-bold"
          />
        </div>
        {due > 0 && (
          <button
            type="button"
            onClick={() => setAmount(String(due))}
            className="mb-2 h-10 cursor-pointer rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold text-ink"
          >
            {t("fillDue", { amount: taka(due) })}
          </button>
        )}
      </div>
      {calls.length > 0 && (
        <div role="radiogroup" aria-labelledby="cb-for-title" className="flex flex-col gap-2">
          <span id="cb-for-title" className="text-[15px] font-semibold">
            {t("forTitle")}
          </span>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => {
              const on = o.id === callId;
              return (
                <label
                  key={o.id || "main"}
                  className={cn(
                    "flex min-h-10.5 cursor-pointer items-center gap-2 rounded-full pr-4 pl-3 text-sm",
                    on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
                  )}
                >
                  <input type="radio" name="cb-for" checked={on} onChange={() => setCallId(o.id)} className="m-0 size-4 accent-brand" />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      )}
      <AccountPicker name="cb-acc" label={t("account")} accounts={accounts} value={accountId} onChange={setAccountId} />
      <div className="flex flex-col gap-2 rounded-xl bg-surface-2 px-4 py-3.5">
        <div className="flex items-center gap-2.5 text-[15px]">
          <span className="grow font-semibold">{t("partnerAfter", { name: p.name })}</span>
          <span className="text-ink-3">{taka(Math.max(0, due))}</span>
          <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
          <strong className={cn("min-w-30 text-right font-bold", after <= 0 ? "text-success" : "text-ink")}>
            {after < 0 ? t("afterAdvance", { amount: taka(-after) }) : after === 0 ? t("afterSettled") : taka(after)}
          </strong>
        </div>
        {account && (
          <div className="flex items-center gap-2.5 text-[15px]">
            <span className="grow font-semibold">{account.name}</span>
            <span className="text-ink-3">{taka(account.balance)}</span>
            <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
            <strong className="min-w-30 text-right font-bold text-success">{taka(account.balance + paying)}</strong>
          </div>
        )}
      </div>
    </FormDialog>
  );
}
