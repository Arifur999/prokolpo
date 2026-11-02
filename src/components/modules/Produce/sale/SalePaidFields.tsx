import { useTranslations } from "next-intl";
import { AccountPicker, type PickableAccount } from "@/components/shared/form/AccountPicker";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { figures, type SaleDraft } from "./saleDraft";

type SalePaidFieldsProps = { draft: SaleDraft; accounts: PickableAccount[]; onChange: (patch: Partial<SaleDraft>) => void };

// Whether the buyer paid in full, how much if not, and into which account (board FarmSaleNew).
export function SalePaidFields({ draft, accounts, onChange }: SalePaidFieldsProps) {
  const t = useTranslations("Produce.form");
  const { amount, got, left } = figures(draft);
  const over = got > amount;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-line-3 bg-surface-3 px-3.5 py-3">
      <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
        <input
          type="checkbox"
          checked={draft.fullPaid}
          onChange={(event) => onChange({ fullPaid: event.target.checked })}
          className="m-0 size-5 accent-brand"
        />
        {t("fullPaid")}
      </label>
      {!draft.fullPaid && (
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="sgot" className="text-sm font-semibold whitespace-nowrap">
            {t("got")}
          </label>
          <MoneyInput
            id="sgot"
            placeholder="0"
            value={draft.got}
            onChange={(value) => onChange({ got: value })}
            invalid={over}
            wrapperClassName="h-10.5 w-45 rounded-[10px] px-3"
            className="text-base"
          />
          <span className={cn("text-sm font-semibold", over ? "text-danger" : "text-gold-ink")}>
            {over ? t("overLeft") : t("left", { amount: formatAmount(Math.max(0, left)) })}
          </span>
        </div>
      )}
      {got > 0 && (
        <AccountPicker
          name="sale-acc"
          label={t("account")}
          accounts={accounts}
          value={draft.accountId}
          onChange={(accountId) => onChange({ accountId })}
          compact
        />
      )}
    </div>
  );
}
