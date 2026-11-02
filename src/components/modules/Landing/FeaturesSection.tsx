import { getTranslations } from "next-intl/server";
import { DuesShowcase } from "./DuesShowcase";
import { FeatureCopy } from "./FeatureCopy";
import { InstallmentsShowcase } from "./InstallmentsShowcase";
import { PartnersShowcase } from "./PartnersShowcase";
import { SectionHeading } from "./SectionHeading";

const TITLE_ID = "lp-features-title";
// Copy column 500px, mock column 600px at the design width; rows alternate sides.
const ROW = "grid items-center gap-10 xl:justify-between xl:gap-0";

export async function FeaturesSection() {
  const t = await getTranslations("Landing.features");
  const points = (feature: "dues" | "partners" | "sales") => [t(`${feature}.points.p1`), t(`${feature}.points.p2`), t(`${feature}.points.p3`)];

  return (
    <section id="lp-features" aria-labelledby={TITLE_ID} className="flex shrink-0 flex-col gap-14 bg-white px-page py-20 xl:h-[1500px]">
      <SectionHeading id={TITLE_ID} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} className="max-w-[760px]" />

      <div className={`${ROW} xl:grid-cols-[500px_600px]`}>
        <FeatureCopy icon="receipt" title={t("dues.title")} body={t("dues.body")} points={points("dues")} />
        <DuesShowcase />
      </div>

      <div className={`${ROW} xl:grid-cols-[600px_500px]`}>
        <div className="order-2 xl:order-1">
          <PartnersShowcase />
        </div>
        <div className="order-1 xl:order-2">
          <FeatureCopy icon="users" title={t("partners.title")} body={t("partners.body")} points={points("partners")} />
        </div>
      </div>

      <div className={`${ROW} xl:grid-cols-[500px_600px]`}>
        <FeatureCopy icon="calendarCheck" title={t("sales.title")} body={t("sales.body")} points={points("sales")} />
        <InstallmentsShowcase />
      </div>
    </section>
  );
}
