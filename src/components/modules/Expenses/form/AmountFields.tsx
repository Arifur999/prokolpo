"use client";

import { useTranslations } from "next-intl";
import { FormSection } from "@/components/shared/form/FormSection";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextInput } from "@/components/shared/form/TextInput";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { amountOf, autoAmount, cleanQuantity, UNITS, type ExpenseValues } from "./expenseValues";

type AmountFieldsProps = {
  values: ExpenseValues;
  set: (patch: Partial<ExpenseValues>) => void;
  error?: string;
};

// "পরিমাণ ও টাকা": quantity, unit and rate work the total out; typing the total takes over.
export function AmountFields({ values, set, error }: AmountFieldsProps) {
  const t = useTranslations("ExpenseForm");
  const auto = autoAmount(values);
  const total = amountOf(values);

  const help =
    !values.amountManual && auto
      ? t("autoDone", { quantity: values.quantity, unit: values.unit, rate: formatAmount(Number(values.rate)) })
      : values.amountManual
        ? t("manual")
        : t("autoHint");

  return (
    <FormSection id="ex-amount-title" inset="md" title={t("amountTitle")} className="gap-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ex-qty" className="text-[15px] font-semibold">
            {t("quantity")} <span className="font-normal text-ink-3">{t("optional")}</span>
          </label>
          <TextInput
            id="ex-qty"
            inputMode="decimal"
            placeholder={t("quantityPlaceholder")}
            value={values.quantity}
            onChange={(event) => set({ quantity: cleanQuantity(event.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ex-unit" className="text-[15px] font-semibold">
            {t("unit")}
          </label>
          <SelectField id="ex-unit" value={values.unit} onChange={(event) => set({ unit: event.target.value })}>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ex-rate" className="text-[15px] font-semibold">
            {t("rate")} <span className="font-normal text-ink-3">{t("ratePer", { unit: values.unit })}</span>
          </label>
          <MoneyInput
            id="ex-rate"
            value={values.rate}
            onChange={(rate) => set({ rate })}
            placeholder={t("ratePlaceholder")}
            maxDigits={12}
            className="font-normal"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ex-amount" className="text-[15px] font-semibold">
          {t("total")} <span className="text-danger">{t("required")}</span>
        </label>
        <MoneyInput
          id="ex-amount"
          aria-required="true"
          invalid={Boolean(error)}
          aria-describedby="ex-amount-msg"
          placeholder="0"
          maxDigits={12}
          value={total ? String(total) : ""}
          onChange={(amount) => set({ amount, amountManual: true })}
          wrapperClassName={cn("h-15 w-full gap-2.5 rounded-xl px-4 sm:w-90", !error && "border-2 border-brand")}
          className="text-2xl font-bold"
        />
        {error ? (
          <p id="ex-amount-msg" className="m-0 flex items-center gap-1.5 text-sm text-danger">
            <Icon name="alertCircle" size={16} strokeWidth={2} />
            {error}
          </p>
        ) : (
          <p id="ex-amount-msg" className={cn("m-0 flex flex-wrap items-center gap-2 text-sm", !values.amountManual && auto ? "text-success" : "text-ink-3")}>
            <Icon name="calculator" size={16} strokeWidth={2} />
            {help}
            {values.amountManual && auto > 0 && (
              <button
                type="button"
                onClick={() => set({ amountManual: false, amount: "" })}
                className="h-7.5 cursor-pointer rounded-lg border-none bg-brand-tint px-2.5 text-[13px] font-semibold text-brand"
              >
                {t("backToAuto")}
              </button>
            )}
          </p>
        )}
      </div>
    </FormSection>
  );
}
