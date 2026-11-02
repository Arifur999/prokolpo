import { useTranslations } from "next-intl";
import { ChoiceChips } from "@/components/shared/form/ChoiceChips";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatQuantity, toDecimalDigits } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IProduceSale, ProduceUnit } from "@/types/produce.types";
import { figures, type SaleDraft } from "./saleDraft";

type SaleAmountFieldsProps = {
  draft: SaleDraft;
  units: ProduceUnit[];
  last: IProduceSale | null;
  submitted: boolean;
  onChange: (patch: Partial<SaleDraft>) => void;
};

// Quantity in a unit, the rate, and their product (board FarmSaleNew).
export function SaleAmountFields({ draft, units, last, submitted, onChange }: SaleAmountFieldsProps) {
  const t = useTranslations("Produce");
  const qty = Number(draft.quantity || 0);
  const rate = Number(draft.rate || 0);
  const unitName = t(`units.${draft.unit}`);

  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sq" className="text-[15px] font-semibold">
          {t("form.qty")} <span className="text-danger">*</span>
        </label>
        <input
          id="sq"
          inputMode="decimal"
          placeholder="0"
          value={draft.quantity}
          onChange={(event) => onChange({ quantity: toDecimalDigits(event.target.value) })}
          aria-invalid={submitted && !qty}
          className={cn(
            "box-border h-11.5 w-full rounded-[10px] bg-white px-3 text-[17px] font-semibold text-ink outline-none focus:border-brand focus:shadow-focus",
            submitted && !qty ? "border-[1.5px] border-danger-strong" : "border border-line",
          )}
        />
        <ChoiceChips
          label={t("form.unit")}
          shape="tiny"
          choices={units.map((u) => ({ value: u, label: t(`units.${u}`) }))}
          value={draft.unit}
          onChange={(unit) => onChange({ unit })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sr" className="text-[15px] font-semibold">
          {t("form.rate")} <span className="font-normal text-ink-3">{t("form.ratePer", { unit: unitName })}</span>
        </label>
        <MoneyInput
          id="sr"
          placeholder="0"
          value={draft.rate}
          onChange={(rate) => onChange({ rate })}
          invalid={submitted && !rate}
          wrapperClassName="h-11.5 rounded-[10px] px-3"
          className="text-[17px]"
        />
        <span className="text-xs text-ink-3">{last ? t("form.lastRate", { rate: formatAmount(last.rate), date: dayFirst(last.date) }) : ""}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold">{t("form.total")}</span>
        <span className="box-border flex h-11.5 items-center rounded-[10px] bg-brand-wash px-3 text-xl font-bold text-brand">
          ৳ {formatAmount(figures(draft).amount)}
        </span>
        <span className="text-xs text-ink-3">{qty && rate ? `${formatQuantity(qty)} ${unitName} × ৳ ${formatAmount(rate)}` : t("form.qtyTimesRate")}</span>
      </div>
    </div>
  );
}
