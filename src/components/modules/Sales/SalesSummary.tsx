import { useTranslations } from "next-intl";
import { formatAmount, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ISale } from "@/types/sales.types";

// The four cards at the top of the sales page (board SalesList).
export function SalesSummary({ sales }: { sales: ISale[] }) {
  const t = useTranslations("Sales");
  const price = sales.reduce((n, s) => n + s.price, 0);
  const received = sales.reduce((n, s) => n + s.standing.received, 0);
  const owing = sales.filter((s) => s.standing.due > 0);
  const lateSum = sales.reduce((n, s) => n + s.standing.lateSum, 0);
  const lateCount = sales.reduce((n, s) => n + s.standing.lateCount, 0);
  const oldest = Math.max(0, ...sales.map((s) => s.standing.late?.days ?? 0));
  const percent = price ? (received / price) * 100 : 0;
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

  return (
    <section aria-label={t("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("sold")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(price)}</p>
        <p className="m-0 text-[13px] text-ink-3">{t("soldSub", { count: sales.length })}</p>
      </article>
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("received")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(received)}</p>
        <div role="img" aria-label={t("receivedAria", { percent: formatPercent(percent) })} className="flex items-center gap-2">
          <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
            <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${percent.toFixed(1)}%` }} />
          </span>
          <span className="text-[13px] text-ink-3">{formatPercent(percent)}</span>
        </div>
      </article>
      <article className={cn(card, "border-gold-line bg-gold-wash")}>
        <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(owing.reduce((n, s) => n + s.standing.due, 0))}</p>
        <p className="m-0 text-[13px] text-ink-2">{t("dueSub", { count: owing.length })}</p>
      </article>
      <article className={cn(card, lateCount ? "border-danger-line bg-danger-tint" : "border-success-line bg-brand-wash")}>
        <h2 className={cn("m-0 text-sm font-semibold", lateCount ? "text-danger" : "text-success")}>{t("late")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(lateSum)}</p>
        <p className="m-0 text-[13px] text-ink-2">{lateCount ? t("lateSub", { count: lateCount, days: oldest }) : t("noLate")}</p>
      </article>
    </section>
  );
}
