import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { Pill } from "./Pill";
import { SectionHeading } from "./SectionHeading";

const TITLE_ID = "lp-kinds-title";

function KindCard({ icon, title, body, children }: { icon: IconName; title: string; body: string; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-line-2 bg-white p-[22px]">
      <span className="flex size-11 items-center justify-center rounded-[13px] bg-brand-tint text-brand">
        <Icon name={icon} size={22} />
      </span>
      <span className="flex flex-col gap-1">
        <h3 className="m-0 text-[19px] font-bold">{title}</h3>
        <span className="text-[15px] leading-[1.6] text-ink-2">{body}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5">{children}</span>
    </article>
  );
}

export async function KindsSection() {
  const t = await getTranslations("Landing.kinds");

  const kinds: { key: string; icon: IconName; title: string; body: string; phases: string[] }[] = [
    {
      key: "building",
      icon: "building",
      title: t("items.building.title"),
      body: t("items.building.body"),
      phases: [t("items.building.phases.p1"), t("items.building.phases.p2"), t("items.building.phases.p3"), t("items.building.phases.p4")],
    },
    {
      key: "farm",
      icon: "sprout",
      title: t("items.farm.title"),
      body: t("items.farm.body"),
      phases: [t("items.farm.phases.p1"), t("items.farm.phases.p2"), t("items.farm.phases.p3")],
    },
    {
      key: "land",
      icon: "map",
      title: t("items.land.title"),
      body: t("items.land.body"),
      phases: [t("items.land.phases.p1"), t("items.land.phases.p2"), t("items.land.phases.p3")],
    },
    {
      key: "business",
      icon: "store",
      title: t("items.business.title"),
      body: t("items.business.body"),
      phases: [t("items.business.phases.p1"), t("items.business.phases.p2"), t("items.business.phases.p3")],
    },
    {
      key: "renovation",
      icon: "paintRoller",
      title: t("items.renovation.title"),
      body: t("items.renovation.body"),
      phases: [t("items.renovation.phases.p1"), t("items.renovation.phases.p2"), t("items.renovation.phases.p3")],
    },
  ];
  const phasesLabel = <span className="text-xs text-ink-3">{t("phasesLabel")}</span>;

  return (
    <section id="lp-kinds" aria-labelledby={TITLE_ID} className="flex shrink-0 flex-col gap-9 px-page py-20 xl:h-[820px]">
      <SectionHeading id={TITLE_ID} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} className="max-w-[680px]" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {kinds.map((kind) => (
          <KindCard key={kind.key} icon={kind.icon} title={kind.title} body={kind.body}>
            {phasesLabel}
            {kind.phases.map((phase) => (
              <Pill key={phase}>{phase}</Pill>
            ))}
          </KindCard>
        ))}
        <KindCard icon="package" title={t("items.other.title")} body={t("items.other.body")}>
          {phasesLabel}
          <Pill className="border border-dashed border-line-strong bg-transparent py-px">{t("items.other.addOwn")}</Pill>
        </KindCard>
      </div>
    </section>
  );
}
