"use client";

import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export type PickableAccount = { id: string; name: string; balance: number };

type AccountPickerProps = { name: string; label: string; accounts: PickableAccount[]; value: string; onChange: (id: string) => void };

// Which money account: one card per account with what it holds (boards PartnerList,
// SaleCollect).
export function AccountPicker({ name, label, accounts, value, onChange }: AccountPickerProps) {
  const t = useTranslations("Common");
  return (
    <div role="radiogroup" aria-labelledby={`${name}-title`} className="flex flex-col gap-2">
      <span id={`${name}-title`} className="text-[15px] font-semibold">
        {label}
      </span>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {accounts.map((a) => {
          const on = a.id === value;
          return (
            <label
              key={a.id}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-xl",
                on ? "border-2 border-brand bg-brand-wash p-2.75" : "border border-line bg-white p-3",
              )}
            >
              <input type="radio" name={name} checked={on} onChange={() => onChange(a.id)} className="m-0 mt-0.5 size-4.5 shrink-0 accent-brand" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{a.name}</span>
                <span className="text-[13px] text-ink-3">{t("accountHas", { amount: formatAmount(a.balance) })}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
