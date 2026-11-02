"use client";

import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export type PickableAccount = { id: string; name: string; balance: number };

type AccountPickerProps = {
  name: string;
  // Shown above the cards; when hidden it still names the group for screen readers.
  label: string;
  accounts: PickableAccount[];
  value: string;
  onChange: (id: string) => void;
  // Smaller cards and no visible title, inside a form section (board FarmSales).
  compact?: boolean;
};

// Which money account: one card per account with what it holds (boards PartnerList,
// SaleCollect).
export function AccountPicker({ name, label, accounts, value, onChange, compact }: AccountPickerProps) {
  const t = useTranslations("Common");
  return (
    <div role="radiogroup" aria-labelledby={`${name}-title`} className="flex flex-col gap-2">
      <span id={`${name}-title`} className={compact ? "sr-only" : "text-[15px] font-semibold"}>
        {label}
      </span>
      <div className={cn("grid grid-cols-1 sm:grid-cols-3", compact ? "gap-2" : "gap-2.5")}>
        {accounts.map((a) => {
          const on = a.id === value;
          return (
            <label
              key={a.id}
              className={cn(
                "flex cursor-pointer items-start",
                compact ? "gap-2 rounded-[10px]" : "gap-2.5 rounded-xl",
                on ? cn("border-2 border-brand bg-brand-wash", compact ? "p-2.25" : "p-2.75") : cn("border border-line bg-white", compact ? "p-2.5" : "p-3"),
              )}
            >
              <input
                type="radio"
                name={name}
                checked={on}
                onChange={() => onChange(a.id)}
                className={cn("m-0 mt-0.5 shrink-0 accent-brand", compact ? "size-4" : "size-4.5")}
              />
              <span className="flex min-w-0 flex-col">
                <span className={cn("truncate font-semibold", compact ? "text-[13px]" : "text-sm")}>{a.name}</span>
                <span className={cn("text-ink-3", compact ? "text-xs" : "text-[13px]")}>{t("accountHas", { amount: formatAmount(a.balance) })}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
