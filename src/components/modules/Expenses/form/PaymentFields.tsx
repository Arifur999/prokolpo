"use client";

import { useTranslations } from "next-intl";
import { FormSection } from "@/components/shared/form/FormSection";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ExpenseValues } from "./expenseValues";

export type AccountOption = { id: string; name: string; balance: number };

type PaymentFieldsProps = {
  values: ExpenseValues;
  set: (patch: Partial<ExpenseValues>) => void;
  accounts: AccountOption[];
  partyName: string | null;
};

// "পেমেন্ট": paid in full now (and from which account), or left on the party's due.
export function PaymentFields({ values, set, accounts, partyName }: PaymentFieldsProps) {
  const t = useTranslations("ExpenseForm");
  const note = values.paidNow ? t("paidNote") : partyName ? t("unpaidNote", { party: partyName }) : t("unpaidNoParty");

  return (
    <FormSection id="ex-pay-title" inset="md" title={t("payTitle")}>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-[14px] p-4",
          values.paidNow ? "border-2 border-brand bg-brand-wash p-3.75" : "border border-line-2 bg-white",
        )}
      >
        <input
          type="checkbox"
          checked={values.paidNow}
          onChange={(event) => set({ paidNow: event.target.checked })}
          className="m-0 mt-px size-5.5 shrink-0 accent-brand"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-base font-semibold">{t("paidNow")}</span>
          <span className="text-sm leading-[1.55] text-ink-2">{note}</span>
        </span>
      </label>
      {values.paidNow && (
        <div role="radiogroup" aria-labelledby="ex-acc-title" className="flex flex-col gap-2">
          <span id="ex-acc-title" className="text-[15px] font-semibold">
            {t("whichAccount")}
          </span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {accounts.map((account) => {
              const on = account.id === values.accountId;
              return (
                <label
                  key={account.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl",
                    on ? "border-2 border-brand bg-brand-wash p-2.75" : "border border-line bg-white p-3",
                  )}
                >
                  <input
                    type="radio"
                    name="ex-acc"
                    checked={on}
                    onChange={() => set({ accountId: account.id })}
                    className="m-0 mt-0.5 size-4.5 shrink-0 accent-brand"
                  />
                  <span className="flex flex-col">
                    <span className="text-[15px] font-semibold">{account.name}</span>
                    <span className="text-[13px] text-ink-3">{t("hasBalance", { amount: formatAmount(account.balance) })}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </FormSection>
  );
}
