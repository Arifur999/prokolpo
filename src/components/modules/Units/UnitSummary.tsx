import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import { unitStatus } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import { UNIT_TYPES, type IUnit } from "@/types/sales.types";

// The four cards at the top of the units page (board Units).
export function UnitSummary({ units }: { units: IUnit[] }) {
  const t = useTranslations("Units");
  const sold = units.filter((u) => u.sale);
  const booked = sold.filter((u) => unitStatus(u) === "BOOKED");
  const free = units.filter((u) => !u.sale);
  const lateCount = sold.reduce((n, u) => n + (u.sale?.standing.lateCount ? 1 : 0), 0);
  const lateSum = sold.reduce((n, u) => n + (u.sale?.standing.lateSum ?? 0), 0);
  const typeLine = UNIT_TYPES.map((type) => [type, units.filter((u) => u.type === type).length] as const)
    .filter(([, n]) => n)
    .map(([type, n]) => t(`typeCount.${type}`, { count: n }))
    .join(" · ");
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";
  const sum = (list: IUnit[], pick: (u: IUnit) => number) => list.reduce((n, u) => n + pick(u), 0);

  return (
    <section aria-label={t("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("total")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">{t("totalCount", { count: units.length })}</p>
        <p className="m-0 text-[13px] text-ink-3">{typeLine || t("nothingYet")}</p>
      </article>
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("sold")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(sum(sold, (u) => u.sale?.price ?? 0))}</p>
        <p className="m-0 text-[13px] text-ink-3">
          {t("soldSub", { count: sold.length, amount: formatAmount(sum(sold, (u) => u.sale?.standing.received ?? 0)) })}
        </p>
      </article>
      <article className={cn(card, "border-gold-line bg-gold-wash")}>
        <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(sum(sold, (u) => Math.max(0, u.sale?.standing.due ?? 0)))}</p>
        <p className="m-0 text-[13px] text-ink-2">
          {lateCount ? t("dueLate", { count: booked.length, late: lateCount, amount: formatAmount(lateSum) }) : t("dueSub", { count: booked.length })}
        </p>
      </article>
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("available")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(sum(free, (u) => u.price))}</p>
        <p className="m-0 text-[13px] text-ink-3">{t("availableSub", { count: free.length })}</p>
      </article>
    </section>
  );
}
