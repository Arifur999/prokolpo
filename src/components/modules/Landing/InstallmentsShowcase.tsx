import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { ShowcaseCard } from "./ShowcaseCard";

const TOTAL_INSTALMENTS = 24;
const PAID_INSTALMENTS = 6;

type InstalmentState = "paid" | "next" | "upcoming";

const STATE_CLASS: Record<InstalmentState, string> = {
  paid: "bg-brand-tint text-success",
  next: "border-2 border-gold-strong bg-gold-tint text-gold-ink",
  upcoming: "bg-surface-4 text-ink-5",
};

const LEGEND_SWATCH: Record<InstalmentState, string> = {
  paid: "bg-brand-tint border-success",
  next: "bg-gold-tint border-gold-strong",
  upcoming: "bg-surface-4 border-line-strong",
};

const stateOf = (instalment: number): InstalmentState =>
  instalment <= PAID_INSTALMENTS ? "paid" : instalment === PAID_INSTALMENTS + 1 ? "next" : "upcoming";

export async function InstallmentsShowcase() {
  const t = await getTranslations("Landing.features.sales.card");
  const instalments = Array.from({ length: TOTAL_INSTALMENTS }, (_, index) => index + 1);
  const legend: InstalmentState[] = ["paid", "next", "upcoming"];

  return (
    <ShowcaseCard
      title={t("title")}
      summary={
        <>
          {t("priceLabel")} <strong className="text-[15px] font-bold text-ink">{t("price")}</strong>
        </>
      }
    >
      <div className="flex flex-col gap-2 px-5 py-3.5">
        <span className="text-[13px] text-ink-2">{t("progress")}</span>
        <span className="grid grid-cols-12 gap-1.5 text-xs font-bold">
          {instalments.map((instalment) => (
            <span key={instalment} className={cn("flex h-[30px] items-center justify-center rounded-[7px]", STATE_CLASS[stateOf(instalment)])}>
              {instalment}
            </span>
          ))}
        </span>
        <span className="flex flex-wrap gap-4 text-xs text-ink-2">
          {legend.map((state) => (
            <span key={state} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-[3px] border", LEGEND_SWATCH[state])} />
              {t(`legend.${state}`)}
            </span>
          ))}
        </span>
      </div>
      <div className="px-5 pb-4">
        <div className="relative flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-dashed border-line-strong bg-surface-3 px-4 py-3">
          <span className="flex flex-col">
            <span className="text-xs text-ink-3">{t("receiptMeta")}</span>
            <span className="text-[15px] font-semibold">{t("receiptAmount")}</span>
          </span>
          <span className="shrink-0 -rotate-6 rounded-[7px] border-2 border-success px-[9px] py-px text-xs font-bold text-success">{t("stamp")}</span>
        </div>
      </div>
    </ShowcaseCard>
  );
}
