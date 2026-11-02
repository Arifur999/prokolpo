import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import type { shopFigures } from "@/lib/shopLook";
import { cn } from "@/lib/utils";

type ShopSummaryProps = { figures: ReturnType<typeof shopFigures>; monthName: string; lastName: string; khataCount: number };

const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

// The four cards at the top of the shop's sales page (board BizSales).
export function ShopSummary({ figures: f, monthName, lastName, khataCount }: ShopSummaryProps) {
  const t = useTranslations("Shop");
  const best = f.best.amount ? dayFirst(f.best.date).slice(0, 5) : "—";
  const net = f.net;

  return (
    <section aria-label={t("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("monthSales", { month: monthName })}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(f.total)}</p>
        <p className="m-0 text-[13px] text-ink-3">{f.dayCount ? t("monthSub", { days: f.dayCount, amount: formatAmount(f.sameDaysLast) }) : t("noDays")}</p>
      </article>
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("monthSales", { month: lastName })}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(f.lastTotal)}</p>
        <p className="m-0 text-[13px] text-ink-3">{f.lastTotal ? t("lastSub", { average: formatAmount(f.lastAverage), best }) : t("noDays")}</p>
      </article>
      <article className={cn(card, "border-gold-line bg-gold-wash")}>
        <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("khata")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(f.khata)}</p>
        <p className="m-0 text-[13px] text-ink-2">{khataCount ? t("khataSub", { count: khataCount, days: f.oldest }) : t("noKhata")}</p>
      </article>
      <article className={cn(card, net < 0 ? "border-danger-line bg-danger-tint" : "border-brand-edge bg-brand-wash")}>
        <h2 className={cn("m-0 text-sm font-semibold", net < 0 ? "text-danger" : "text-success")}>{t("net", { month: lastName })}</h2>
        <p className={cn("m-0 text-[26px] leading-[1.2] font-bold", net < 0 ? "text-danger" : "text-success")}>
          {net < 0 ? "−" : "+"} ৳ {formatAmount(Math.abs(net))}
        </p>
        <p className="m-0 text-[13px] text-ink-2">{t("netSub", { sales: formatAmount(f.lastTotal), spent: formatAmount(f.spent) })}</p>
      </article>
    </section>
  );
}
