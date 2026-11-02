import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { ShowcaseCard } from "./ShowcaseCard";

const PARTNERS = [
  { key: "r1", share: 40, dot: "bg-share-1", isPaidUp: true },
  { key: "r2", share: 25, dot: "bg-share-2", isPaidUp: true },
  { key: "r3", share: 20, dot: "bg-share-3", isPaidUp: false },
  { key: "r4", share: 15, dot: "bg-share-4", isPaidUp: false },
] as const;

export async function PartnersShowcase() {
  const t = await getTranslations("Landing.features.partners.card");

  return (
    <ShowcaseCard
      title={t("title")}
      summary={
        <>
          {t("paidLabel")} <strong className="text-[15px] font-bold text-ink">{t("paid")}</strong> {t("target")}
        </>
      }
      footer={t("footer")}
    >
      <div className="flex flex-col gap-1.5 px-5 pt-3.5 pb-2">
        <span className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          {PARTNERS.map((partner) => (
            <span key={partner.key} className={partner.dot} style={{ width: `${partner.share}%` }} />
          ))}
        </span>
        <span className="text-xs text-ink-3">{t("shareCaption")}</span>
      </div>
      {PARTNERS.map((partner) => (
        <div key={partner.key} className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2.5 px-5 py-2 last:pb-3">
          <span className={cn("size-2.5 rounded-full", partner.dot)} />
          <span className="text-[15px] font-semibold">
            {t(`rows.${partner.key}.name`)} <span className="font-medium text-ink-3">{t(`rows.${partner.key}.share`)}</span>
          </span>
          <span
            className={cn(
              "rounded-full px-[9px] py-px text-[13px] font-semibold",
              partner.isPaidUp ? "bg-brand-tint text-success" : "bg-gold-tint text-gold-ink",
            )}
          >
            {t(`rows.${partner.key}.status`)}
          </span>
        </div>
      ))}
    </ShowcaseCard>
  );
}
