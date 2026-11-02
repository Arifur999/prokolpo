import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount, formatPercent } from "@/lib/money";
import { dueOf, owedBy, percentText, toTenths } from "@/lib/partnerMath";
import { cn } from "@/lib/utils";
import type { IPartner } from "@/types/partners.types";

// The four cards at the top of the partners page (board PartnerList).
export function PartnerSummary({ partners }: { partners: IPartner[] }) {
  const t = useTranslations("Partners");
  const should = partners.reduce((sum, p) => sum + owedBy(p), 0);
  const main = partners.reduce((sum, p) => sum + p.committed, 0);
  const paid = partners.reduce((sum, p) => sum + p.paid, 0);
  const due = partners.reduce((sum, p) => sum + Math.max(0, dueOf(p)), 0);
  const owing = partners.filter((p) => dueOf(p) > 0).length;
  const shareTenths = partners.reduce((sum, p) => sum + toTenths(p.share), 0);
  const shareOk = shareTenths === 1000;
  const paidPercent = should ? (paid / should) * 100 : 0;
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

  return (
    <section aria-label={t("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("should")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(should)}</p>
        <p className="m-0 text-[13px] text-ink-3">{t("shouldSub", { main: formatAmount(main), calls: formatAmount(should - main) })}</p>
      </article>
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("paid")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(paid)}</p>
        <div role="img" aria-label={t("paidAria", { percent: formatPercent(paidPercent) })} className="flex items-center gap-2">
          <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
            <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, paidPercent).toFixed(1)}%` }} />
          </span>
          <span className="text-[13px] text-ink-3">{formatPercent(paidPercent)}</span>
        </div>
      </article>
      <article className={cn(card, "border-gold-line bg-gold-wash")}>
        <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(due)}</p>
        <p className="m-0 text-[13px] text-ink-2">{t("dueSub", { count: partners.length, due: owing })}</p>
      </article>
      <article className={cn(card, shareOk ? "border-line-2 bg-white" : "border-danger-line bg-danger-tint")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("shareTotal")}</h2>
        <p className={cn("m-0 flex items-center gap-2 text-[26px] leading-[1.2] font-bold", shareOk ? "text-success" : "text-danger")}>
          {percentText(shareTenths / 10)}
          {shareOk && <Icon name="checkCircle" size={22} strokeWidth={2} />}
        </p>
        <p className={cn("m-0 text-[13px]", shareOk ? "text-ink-3" : "font-semibold text-danger")}>{shareOk ? t("shareOk") : t("shareBad")}</p>
      </article>
    </section>
  );
}
