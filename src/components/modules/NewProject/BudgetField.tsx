"use client";

import { useTranslations } from "next-intl";
import { formatAmount, toLatinDigits } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useAmountWords } from "./useAmountWords";

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
      <div className="box-border flex h-12 items-center gap-2 rounded-lg border border-line bg-white px-3.5 focus-within:border-brand focus-within:shadow-focus">
        <span aria-hidden="true" className="text-lg font-semibold text-ink-2">
          ৳
        </span>
        <input
          id="np-budget"
          inputMode="numeric"
          placeholder={t("budgetPlaceholder")}
          value={value ? formatAmount(Number(value)) : ""}
          onChange={(event) => onChange(toLatinDigits(event.target.value).slice(0, 13))}
          aria-describedby="np-budget-help"
          className="h-full min-w-0 grow border-none bg-transparent p-0 text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-4"
        />
      </div>
      <p id="np-budget-help" className={cn("m-0 text-[13px]", words ? "font-semibold text-success" : "text-ink-3")}>
        {words || t("budgetHelp")}
      </p>
    </div>
  );
}
