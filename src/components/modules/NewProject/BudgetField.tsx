"use client";

import { useTranslations } from "next-intl";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { cn } from "@/lib/utils";
import { useAmountWords } from "@/hooks/useAmountWords";

type BudgetFieldProps = { value: string; onChange: (digits: string) => void };

// ৳ input that groups as you type and spells the amount out below it.
export function BudgetField({ value, onChange }: BudgetFieldProps) {
  const t = useTranslations("NewProject");
  const words = useAmountWords()(Number(value || 0));

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="np-budget" className="text-[15px] font-semibold">
        {t("budget")} <span className="font-normal text-ink-3">{t("optional")}</span>
      </label>
      <MoneyInput id="np-budget" value={value} onChange={onChange} maxDigits={13} placeholder={t("budgetPlaceholder")} aria-describedby="np-budget-help" />
      <p id="np-budget-help" className={cn("m-0 text-[13px]", words ? "font-semibold text-success" : "text-ink-3")}>
        {words || t("budgetHelp")}
      </p>
    </div>
  );
}
