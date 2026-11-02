"use client";

import { useTranslations } from "next-intl";
import { DateField } from "@/components/shared/form/DateField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { useAmountWords } from "@/hooks/useAmountWords";
import { formatAmount } from "@/lib/money";
import { planInstallments } from "@/lib/saleLook";
import { cn } from "@/lib/utils";
import type { SaleDraft, SaleErrors } from "./saleDraft";

type SalePriceFieldsProps = { draft: SaleDraft; listPrice: number; errors: SaleErrors; onChange: (patch: Partial<SaleDraft>) => void };

const chip = (on: boolean) => (on ? "border-[1.5px] border-brand bg-brand-wash" : "border border-line bg-white");

// "৩. দাম আর টাকা কীভাবে দেবেন" (board SaleNew): price and date, full or in installments,
// the down payment, how many installments, how often and from when.
export function SalePriceFields({ draft, listPrice, errors, onChange }: SalePriceFieldsProps) {
  const t = useTranslations("SaleNew");
  const words = useAmountWords();
  const price = Number(draft.price || 0);
  const down = Number(draft.down || 0);
  const plan = planInstallments(price, down, draft.count, draft.interval, draft.firstDue);
  const priceHelp =
    price && price < listPrice
      ? t("priceLess", { words: words(price), amount: formatAmount(listPrice - price) })
      : price > listPrice
        ? t("priceMore", { words: words(price), amount: formatAmount(price - listPrice) })
        : words(price);
  const downHelp = errors.down
    ? t(errors.down === "tooSmall" ? "tooSmall" : "downError")
    : down
      ? t("downHelp", { words: words(down), percent: `${Math.round((down / price) * 1000) / 10}%` })
      : t("downNone");

  return (
    <section aria-labelledby="s-price-title" className="flex flex-col gap-4 px-5 py-5.5 lg:px-7">
      <h2 id="s-price-title" className="m-0 text-[17px] font-semibold">
        {t("priceTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-price" className="text-[15px] font-semibold">
            {t("price")} <span className="text-danger">*</span>
          </label>
          <MoneyInput
            id="s-price"
            aria-required="true"
            placeholder="0"
            value={draft.price}
            onChange={(v) => onChange({ price: v })}
            invalid={!!errors.price}
            wrapperClassName={cn("h-14 gap-2.5 rounded-xl px-4", !errors.price && "border-2 border-brand")}
            className="text-[22px] font-bold"
          />
          <span className={cn("text-[13px] font-semibold", errors.price ? "text-danger" : price > listPrice ? "text-gold-ink" : "text-success")}>
            {errors.price ? t("priceError") : priceHelp}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="s-date" className="text-[15px] font-semibold">
            {t("date")}
          </label>
          <DateField id="s-date" value={draft.date} onChange={(date) => onChange({ date })} />
        </div>
      </div>
      <div role="radiogroup" aria-label={t("plansLabel")} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {(
          [
            ["KIST", t("planKist"), t("planKistSub")],
            ["FULL", t("planFull"), t("planFullSub")],
          ] as const
        ).map(([value, label, sub]) => {
          const on = draft.plan === value;
          return (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl",
                on ? "border-2 border-brand bg-brand-wash px-3.75 py-3.25" : "border border-line bg-white px-4 py-3.5",
              )}
            >
              <input type="radio" name="plan" checked={on} onChange={() => onChange({ plan: value })} className="m-0 mt-0.5 size-5 shrink-0 accent-brand" />
              <span className="flex flex-col">
                <span className="text-base font-semibold">{label}</span>
                <span className="text-[13px] text-ink-2">{sub}</span>
              </span>
            </label>
          );
        })}
      </div>
      {draft.plan === "KIST" && (
        <div className="flex flex-col gap-4 rounded-[14px] border border-line-3 bg-surface-3 p-4.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="s-down" className="text-[15px] font-semibold">
              {t("down")}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <MoneyInput
                id="s-down"
                placeholder="0"
                value={draft.down}
                onChange={(v) => onChange({ down: v })}
                invalid={!!errors.down}
                wrapperClassName="h-13 w-65 shrink-0 gap-2.5 rounded-xl px-4"
                className="text-xl font-bold"
              />
              <div className="flex gap-1.5">
                {[20, 30, 40, 50].map((p) => {
                  const v = Math.round((price * p) / 100 / 1000) * 1000;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onChange({ down: String(v) })}
                      className={cn("h-8.5 cursor-pointer rounded-full px-3 text-[13px] font-semibold text-ink", chip(!!v && down === v))}
                    >
                      {p}%
                    </button>
                  );
                })}
              </div>
            </div>
            <span className={cn("text-[13px] font-semibold", errors.down ? "text-danger" : down ? "text-success" : "text-ink-3")}>{downHelp}</span>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_190px]">
            <div className="flex flex-col gap-1.5">
              <span id="s-n-title" className="text-[15px] font-semibold">
                {t("count")}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-labelledby="s-n-title" className="flex items-center overflow-hidden rounded-[10px] border border-line bg-white">
                  <button
                    type="button"
                    aria-label={t("less")}
                    onClick={() => onChange({ count: Math.max(1, draft.count - 1) })}
                    className="h-10.5 w-9.5 cursor-pointer border-none bg-white text-xl text-ink"
                  >
                    −
                  </button>
                  <span aria-live="polite" className="min-w-10 text-center text-[17px] font-bold">
                    {draft.count}
                  </span>
                  <button
                    type="button"
                    aria-label={t("more")}
                    onClick={() => onChange({ count: Math.min(120, draft.count + 1) })}
                    className="h-10.5 w-9.5 cursor-pointer border-none bg-white text-xl text-ink"
                  >
                    +
                  </button>
                </div>
                {[12, 24, 36].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onChange({ count: n })}
                    className={cn("h-8 cursor-pointer rounded-full px-2.5 text-[13px] font-semibold text-ink", chip(draft.count === n))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span id="s-iv-title" className="text-[15px] font-semibold">
                {t("interval")}
              </span>
              <div role="radiogroup" aria-labelledby="s-iv-title" className="flex flex-wrap gap-1.5">
                {([1, 3, 6] as const).map((iv) => (
                  <button
                    key={iv}
                    type="button"
                    role="radio"
                    aria-checked={draft.interval === iv}
                    onClick={() => onChange({ interval: iv })}
                    className={cn(
                      "h-10.5 cursor-pointer rounded-[10px] px-3 text-sm text-ink",
                      chip(draft.interval === iv),
                      draft.interval === iv ? "font-bold" : "font-medium",
                    )}
                  >
                    {t(`every${iv}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="s-first" className="text-[15px] font-semibold">
                {t("firstDue")}
              </label>
              <DateField id="s-first" value={draft.firstDue} onChange={(firstDue) => onChange({ firstDue })} />
              {errors.firstDue && <span className="text-[13px] text-danger">{t("firstError")}</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line-2 bg-white px-4 py-3.5">
            <span className="flex grow flex-col">
              <span className="text-[13px] text-ink-2">{t("each")}</span>
              <span className="text-2xl leading-[1.25] font-bold text-brand">{plan.each > 0 ? `৳ ${formatAmount(plan.each)}` : "—"}</span>
            </span>
            {plan.each > 0 && (
              <span className="max-w-75 text-[13px] leading-[1.55] text-ink-3">
                {plan.last !== plan.each
                  ? t("eachNoteLast", { rest: formatAmount(price - down), count: draft.count, last: formatAmount(plan.last) })
                  : t("eachNote", { rest: formatAmount(price - down), count: draft.count })}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
