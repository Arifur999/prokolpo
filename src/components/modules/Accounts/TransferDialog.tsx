"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { transferAction } from "@/app/(dashboardLayout)/projects/[projectId]/accounts/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IAccount } from "@/types/books.types";

type TransferDialogProps = { projectId: string; accounts: IAccount[]; onClose: () => void };

const taka = (n: number) => (n < 0 ? `−৳ ${formatAmount(-n)}` : `৳ ${formatAmount(n)}`);

// "এক অ্যাকাউন্ট থেকে আরেকটায় টাকা সরান" (board AccountsTransfer). Not spending: the total
// on hand stays the same.
export function TransferDialog({ projectId, accounts, onClose }: TransferDialogProps) {
  const t = useTranslations("Accounts.transferDialog");
  const router = useRouter();
  const [from, setFrom] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [to, setTo] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const moving = Number(amount || 0);
  const fromAccount = accounts.find((a) => a.id === from);
  const toAccount = accounts.find((a) => a.id === to);
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const error = submitted ? (!moving ? t("amountError") : from === to ? t("sameError") : null) : null;

  const pickFrom = (id: string) => {
    setFrom(id);
    if (id === to) setTo(accounts.find((a) => a.id !== id)?.id ?? "");
  };

  const save = () => {
    setSubmitted(true);
    if (!moving || from === to || !fromAccount || !toAccount) return;
    startTransition(async () => {
      const result = await transferAction(projectId, { fromAccountId: from, toAccountId: to, amount: moving, note: note.trim() });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { amount: formatAmount(moving), from: fromAccount.name, to: toAccount.name }));
      onClose();
      router.refresh();
    });
  };

  const option = (a: IAccount, on: boolean, onPick: () => void, name: string, note: string, disabled = false) => (
    <label
      key={a.id}
      className={cn(
        "flex items-start gap-2.5 rounded-xl",
        on ? "border-2 border-brand bg-brand-wash p-2.75" : "border border-line bg-white p-3",
        disabled ? "cursor-default opacity-50" : "cursor-pointer",
      )}
    >
      <input type="radio" name={name} checked={on} disabled={disabled} onChange={onPick} className="m-0 mt-0.5 size-4.5 shrink-0 accent-brand" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{a.name}</span>
        <span className="text-[13px] text-ink-3">{note}</span>
      </span>
    </label>
  );

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle")}
      closeLabel={t("close")}
      onClose={onClose}
      topClass="top-14"
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div role="radiogroup" aria-labelledby="tr-from-title" className="flex flex-col gap-2">
        <span id="tr-from-title" className="text-[15px] font-semibold">
          {t("from")}
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {accounts.map((a) => option(a, a.id === from, () => pickFrom(a.id), "tr-from", t("has", { amount: taka(a.balance) })))}
        </div>
      </div>
      <div role="radiogroup" aria-labelledby="tr-to-title" className="flex flex-col gap-2">
        <span id="tr-to-title" className="text-[15px] font-semibold">
          {t("to")}
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {accounts.map((a) =>
            option(a, a.id === to, () => setTo(a.id), "tr-to", a.id === from ? t("isFrom") : t("has", { amount: taka(a.balance) }), a.id === from),
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tr-amount" className="text-[15px] font-semibold">
            {t("amount")} <span className="text-danger">*</span>
          </label>
          <MoneyInput
            id="tr-amount"
            aria-required="true"
            invalid={submitted && !moving}
            placeholder={t("amountPlaceholder")}
            value={amount}
            onChange={setAmount}
          />
        </div>
        <LabeledInput
          id="tr-note"
          label={t("note")}
          labelNote={t("optional")}
          maxLength={500}
          placeholder={t("notePlaceholder")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      {error && (
        <p className="m-0 flex items-center gap-1.5 text-sm text-danger">
          <Icon name="alertCircle" size={16} strokeWidth={2} />
          {error}
        </p>
      )}
      {fromAccount && toAccount && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-2 px-4 py-3.5">
          <span className="text-sm font-semibold text-ink-2">{t("after")}</span>
          {[
            { account: fromAccount, after: fromAccount.balance - moving },
            { account: toAccount, after: toAccount.balance + moving },
          ].map(({ account, after }) => (
            <div key={account.id} className="flex items-center gap-2.5 text-[15px]">
              <span className="grow font-semibold">{account.name}</span>
              <span className="text-ink-3">{taka(account.balance)}</span>
              <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
              <strong className={cn("min-w-27.5 text-right font-bold", after < 0 && "text-danger")}>{taka(after)}</strong>
            </div>
          ))}
          {moving > 0 && fromAccount.balance - moving < 0 && (
            <span className="text-[13px] font-semibold text-danger">{t("short", { account: fromAccount.name })}</span>
          )}
          <span className="text-[13px] text-ink-3">{t("unchanged", { amount: taka(total) })}</span>
        </div>
      )}
    </FormDialog>
  );
}
