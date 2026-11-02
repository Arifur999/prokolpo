import { useLocale, useTranslations } from "next-intl";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Icon } from "@/components/shared/icon/Icon";
import { weekdayName } from "@/lib/dhakaTime";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { daySales } from "@/lib/shopLook";
import { cn } from "@/lib/utils";
import type { IShopDay } from "@/types/shop.types";

export type Flow = { key: string; title: string; before: number; after: number; up: "good" | "owed" };

type DayAsideProps = {
  sales: number;
  compare: IShopDay | null;
  flows: Flow[];
  expectCash: number;
  counted: string;
  onCounted: (value: string) => void;
};

const taka = (n: number) => `৳ ${formatAmount(n)}`;

// "দিনের সারাংশ" (board BizDayNew): the day's sales, where the money lands, and a cash count.
export function DayAside({ sales, compare, flows, expectCash, counted, onCounted }: DayAsideProps) {
  const t = useTranslations("Shop.form");
  const locale = useLocale() as "bn" | "en";
  const diff = Number(counted || 0) - expectCash;

  return (
    <aside aria-label={t("aside")} className="flex flex-col gap-3 border-t border-line-3 bg-surface-2 px-5 py-4 lg:border-t-0 lg:border-l">
      <div className="flex flex-col gap-0.5 border-b border-line-2 pb-3">
        <span className="text-[13px] text-ink-2">{t("total")}</span>
        <strong className="text-[28px] leading-[1.2] font-bold text-brand">{taka(sales)}</strong>
        {compare && (
          <span className="text-xs text-ink-3">
            {t("compare", {
              weekday: weekdayName(new Date(compare.date), locale),
              date: dayFirst(compare.date).slice(0, 5),
              amount: formatAmount(daySales(compare)),
            })}
          </span>
        )}
      </div>
      {flows.map((f) => (
        <div key={f.key} className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold">{f.title}</span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="text-ink-3">{taka(f.before)}</span>
            <Icon name="arrowRight" size={14} strokeWidth={2} className="text-ink-3" />
            <strong className={cn("font-bold", f.up === "owed" && f.after > f.before ? "text-gold-ink" : "text-success")}>{taka(f.after)}</strong>
          </span>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 rounded-xl border border-line-2 bg-white p-3">
        <span className="text-sm font-semibold">{t("check")}</span>
        <span className="text-[13px] text-ink-2">
          {t("expect")} <strong className="text-ink">{taka(expectCash)}</strong>
        </span>
        <label htmlFor="counted" className="text-xs text-ink-3">
          {t("counted")}
        </label>
        <MoneyInput
          id="counted"
          placeholder="0"
          value={counted}
          onChange={onCounted}
          wrapperClassName="h-10 gap-1.5 rounded-[10px] px-2.5"
          className="text-[15px]"
        />
        {Number(counted || 0) > 0 && (
          <span className={cn("rounded-lg px-2 py-1.5 text-[13px] font-semibold", diff === 0 ? "bg-brand-tint text-success" : "bg-danger-tint text-danger")}>
            {diff === 0 ? t("matched") : diff < 0 ? t("short", { amount: formatAmount(-diff) }) : t("extra", { amount: formatAmount(diff) })}
          </span>
        )}
      </div>
    </aside>
  );
}
