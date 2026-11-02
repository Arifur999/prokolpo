import { getTranslations } from "next-intl/server";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { InfoCard } from "./InfoCard";
import { SectionHeading } from "./SectionHeading";

const TITLE_ID = "lp-more-title";

const ITEMS = [
  { key: "reports", icon: "chart" },
  { key: "budget", icon: "alertTriangle" },
  { key: "team", icon: "users" },
  { key: "history", icon: "history" },
  { key: "accounts", icon: "wallet" },
  { key: "language", icon: "language" },
] as const satisfies readonly { key: string; icon: IconName }[];

export async function MoreSection() {
  const t = await getTranslations("Landing.more");

  return (
    <section aria-labelledby={TITLE_ID} className="flex shrink-0 flex-col gap-9 px-page py-20 xl:h-180">
      <SectionHeading id={TITLE_ID} eyebrow={t("eyebrow")} title={t("title")} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ITEMS.map((item) => (
          <InfoCard key={item.key} size="md" icon={item.icon} title={t(`items.${item.key}.title`)} body={t(`items.${item.key}.body`)} />
        ))}
      </div>
    </section>
  );
}
