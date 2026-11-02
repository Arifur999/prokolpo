import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { ShowcaseCard } from "./ShowcaseCard";

const ROWS: { key: "r1" | "r2" | "r3"; icon: IconName }[] = [
  { key: "r1", icon: "store" },
  { key: "r2", icon: "store" },
  { key: "r3", icon: "hammer" },
];

export async function DuesShowcase() {
  const t = await getTranslations("Landing.features.dues.card");

  return (
    <ShowcaseCard
      title={t("title")}
      summary={
        <>
          {t("totalLabel")} <strong className="text-[15px] font-bold text-gold-ink">{t("total")}</strong>
        </>
      }
      footer={t("footer")}
    >
      <div className="divide-y divide-surface-4">
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-center gap-3 px-5 py-2.5">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-lg bg-surface-4 text-ink-2">
            <Icon name={row.icon} size={18} />
          </span>
          <span className="flex grow flex-col">
            <span className="text-[15px] font-semibold">{t(`rows.${row.key}.name`)}</span>
            <span className="text-xs text-ink-3">{t(`rows.${row.key}.sub`)}</span>
          </span>
          <strong className="text-base font-bold text-gold-ink">{t(`rows.${row.key}.amount`)}</strong>
        </div>
      ))}
      </div>
    </ShowcaseCard>
  );
}
