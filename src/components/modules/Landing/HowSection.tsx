import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { OwnershipCard } from "./OwnershipCard";
import { SectionHeading } from "./SectionHeading";

const TITLE_ID = "lp-how-title";
const STEPS = ["account", "project", "team"] as const;
const TAGS = ["t1", "t2", "t3", "t4", "t5"] as const;

export async function HowSection() {
  const t = await getTranslations("Landing.how");

  return (
    <section id="lp-how" aria-labelledby={TITLE_ID} className="flex shrink-0 flex-col gap-11 bg-white px-page py-20 xl:h-205">
      <SectionHeading id={TITLE_ID} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <ol className="relative m-0 grid list-none gap-10 p-0 md:grid-cols-3">
        {/* The dashed rail runs from the first badge to the last, behind the numbers. */}
        <li aria-hidden="true" className="absolute top-[25px] right-[374px] left-13 hidden border-t-2 border-dashed border-line xl:block" />
        {STEPS.map((step, index) => {
          const isLast = index === STEPS.length - 1;
          return (
            <li key={step} className="relative flex flex-col gap-3.5">
              <span
                className={cn(
                  "flex size-13 items-center justify-center rounded-full text-[22px] font-bold",
                  isLast ? "bg-gold text-ink" : "bg-brand text-white",
                )}
              >
                {index + 1}
              </span>
              <span className="flex flex-col gap-1.5">
                <h3 className="m-0 text-[19px] font-bold">{t(`steps.${step}.title`)}</h3>
                <span className="text-[15px] leading-[1.6] text-ink-2">{t(`steps.${step}.body`)}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-3.5">
        <h3 className="m-0 text-lg font-bold">{t("ownership.title")}</h3>
        <div className="grid gap-5 md:grid-cols-2">
          <OwnershipCard
            title={t("ownership.personal.title")}
            badge={t("ownership.personal.badge")}
            body={t("ownership.personal.body")}
            tags={TAGS.map((tag) => t(`ownership.personal.tags.${tag}`))}
          />
          <OwnershipCard
            isJoint
            title={t("ownership.joint.title")}
            badge={t("ownership.joint.badge")}
            body={t("ownership.joint.body")}
            tags={TAGS.map((tag) => t(`ownership.joint.tags.${tag}`))}
          />
        </div>
        <p className="m-0 text-[13px] text-ink-3">{t("ownership.note")}</p>
      </div>
    </section>
  );
}
