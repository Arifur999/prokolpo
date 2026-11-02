"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { dhakaToday } from "@/lib/dhakaTime";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IPaymentPayload } from "@/types/books.types";
import { DateField } from "./form/DateField";
import { MoneyInput } from "./form/MoneyInput";
import { TextInput } from "./form/TextInput";
import { DialogButtons, FormDialog } from "./FormDialog";
import { Icon } from "./icon/Icon";

export type PayAccount = { id: string; name: string; balance: number };
export type QuickAmount = { label: string; amount: number };

type PayDialogProps = {
  name: string;
  sub: string;
  due: number;
  // Contractors are owed ("পাওনা"); suppliers have a due ("বাকি").
  variant: "supplier" | "contractor";
  accounts: PayAccount[];
  quick: QuickAmount[];
  // The bill or purpose choice beside the date.
  extra?: ReactNode;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payment: IPaymentPayload, print: boolean) => void;
  // Fields the extra choice contributes to the payment.
  extraPayload?: Partial<IPaymentPayload>;
};

const pick = (on: boolean) => (on ? "border-2 border-brand bg-brand-wash p-2.75" : "border border-line bg-white p-3");

// "পেমেন্ট দিন": amount with quick picks, the paying account, the date and a note, and
// where the due and the account will stand after (boards SupplierPay, ContractorPay).
export function PayDialog({ name, sub, due, variant, accounts, quick, extra, extraPayload, pending, onClose, onSubmit }: PayDialogProps) {
  const t = useTranslations("PayDialog");
  const contractor = variant === "contractor";
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(dhakaToday());
  const [note, setNote] = useState("");
  const [print, setPrint] = useState(false);

  const paying = Number(amount || 0);
  const account = accounts.find((a) => a.id === accountId);
  const dueAfter = due - paying;
  const accountAfter = (account?.balance ?? 0) - paying;
  const taka = (n: number) => (n < 0 ? t("advance", { amount: formatAmount(-n) }) : `৳ ${formatAmount(n)}`);
  const balance = (n: number) => (n < 0 ? t("minus", { amount: formatAmount(-n) }) : `৳ ${formatAmount(n)}`);
  const quickUnique = quick.filter((q, i) => q.amount > 0 && quick.findIndex((x) => x.amount === q.amount) === i);

  const submit = () => onSubmit({ accountId, amount: paying, date, note: note.trim(), ...extraPayload }, print);

  return (
    <FormDialog
      size="lg"
      topClass="top-9"
      title={t("title")}
      closeLabel={t("close")}
      onClose={onClose}
      band={
        <div className="flex items-center gap-3.5 border-b border-line-3 bg-surface-2 px-6 py-3.5">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-[17px] font-bold text-brand">
            {Array.from(name)[0]}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-base font-semibold">{name}</span>
            <span className="truncate text-[13px] text-ink-3">{sub}</span>
          </span>
          <span className="ml-auto flex flex-col items-end">
            <span className="text-[13px] text-ink-2">{contractor ? t("dueNowContractor") : t("dueNow")}</span>
            <span className="text-[22px] leading-tight font-bold text-gold-ink">{taka(due)}</span>
          </span>
        </div>
      }
      footer={
        <>
          <label className="mr-auto flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={print} onChange={(event) => setPrint(event.target.checked)} className="m-0 size-4.5 accent-brand" />
            {contractor ? t("printContractor") : t("print")}
          </label>
          <DialogButtons
            cancel={t("cancel")}
            submit={paying ? t(contractor ? "submitAmountContractor" : "submitAmount", { amount: formatAmount(paying) }) : t("submit")}
            onCancel={onClose}
            onSubmit={submit}
            pending={pending}
            disabled={!paying || !accountId}
          />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="pay-amount" className="text-[15px] font-semibold">
          {t("amount")} <span className="text-danger">{t("required")}</span>
        </label>
        <div className="flex flex-wrap items-center gap-3.5">
          <MoneyInput
            id="pay-amount"
            autoFocus
            aria-required="true"
            placeholder="0"
            value={amount}
            onChange={setAmount}
            wrapperClassName="h-14 w-62.5 shrink-0 gap-2.5 rounded-xl border-2 border-brand px-4"
            className="text-[22px] font-bold"
          />
          <div role="group" aria-label={t("quickLabel")} className="flex flex-wrap gap-1.5">
            {quickUnique.map((q) => {
              const on = paying === q.amount;
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setAmount(String(q.amount))}
                  className={cn(
                    "h-8.5 cursor-pointer rounded-full px-3 text-[13px] font-semibold whitespace-nowrap",
                    on ? "border-[1.5px] border-brand bg-brand-wash text-brand" : "border border-line bg-white text-ink",
                  )}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="pay-acc-title" className="flex flex-col gap-2">
        <span id="pay-acc-title" className="text-[15px] font-semibold">
          {t("account")}
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {accounts.map((a) => (
            <label key={a.id} className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl", pick(a.id === accountId))}>
              <input
                type="radio"
                name="pay-acc"
                checked={a.id === accountId}
                onChange={() => setAccountId(a.id)}
                className="m-0 mt-0.5 size-4.5 shrink-0 accent-brand"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{a.name}</span>
                <span className="text-[13px] text-ink-3">{t("hasBalance", { amount: formatAmount(a.balance) })}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div>{extra}</div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pay-date" className="text-[15px] font-semibold">
            {t("date")}
          </label>
          <DateField id="pay-date" value={date} onChange={setDate} />
          <label htmlFor="pay-note" className="mt-1 text-[15px] font-semibold">
            {t("note")} <span className="font-normal text-ink-3">{t("optional")}</span>
          </label>
          <TextInput
            id="pay-note"
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={contractor ? t("notePlaceholderContractor") : t("notePlaceholder")}
            className="h-11 px-3 text-[15px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-surface-2 px-4 py-3.5">
        <span className="text-sm font-semibold text-ink-2">{t("after")}</span>
        <div className="flex items-center gap-2.5 text-[15px]">
          <span className="grow font-semibold">{contractor ? t("partyOwed", { name }) : t("partyDue", { name })}</span>
          <span className="text-ink-3">{taka(due)}</span>
          <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
          <strong className={cn("min-w-27.5 text-right font-bold", dueAfter < 0 ? "text-info" : dueAfter === 0 && paying ? "text-success" : "")}>
            {taka(dueAfter)}
          </strong>
        </div>
        {account && (
          <div className="flex items-center gap-2.5 text-[15px]">
            <span className="grow font-semibold">{account.name}</span>
            <span className="text-ink-3">{balance(account.balance)}</span>
            <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
            <strong className={cn("min-w-27.5 text-right font-bold", accountAfter < 0 && "text-danger")}>{balance(accountAfter)}</strong>
          </div>
        )}
        {paying > 0 && dueAfter === 0 && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-brand-tint px-2.5 py-0.5 text-[13px] font-semibold text-success">
            <Icon name="check" size={14} strokeWidth={2.6} />
            {contractor ? t("fullContractor") : t("full")}
          </span>
        )}
        {paying > 0 && dueAfter < 0 && due >= 0 && (
          <span className="text-[13px] font-semibold text-gold-ink">{t(contractor ? "overContractor" : "over", { amount: formatAmount(-dueAfter) })}</span>
        )}
        {paying > 0 && accountAfter < 0 && <span className="text-[13px] font-semibold text-danger">{t("short")}</span>}
      </div>
    </FormDialog>
  );
}
