import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES } from "@/lib/routes";
import { HeroPreview } from "./HeroPreview";
import { LandingHeader } from "./LandingHeader";

const HERO_POINTS = ["mobile", "team", "language"] as const;

export async function HeroSection() {
  const t = await getTranslations("Landing");

  return (
    <div className="relative shrink-0 overflow-hidden bg-brand text-white xl:h-[720px]">
      <div aria-hidden="true" className="absolute -bottom-[300px] -left-[200px] size-[640px] rounded-full border border-white/7" />
      <div aria-hidden="true" className="absolute -bottom-[210px] -left-[110px] size-[460px] rounded-full border border-white/7" />
      <div aria-hidden="true" className="absolute top-[110px] right-10 size-[600px] rounded-full bg-gold/7" />

      <LandingHeader />

      <div className="relative grid items-center gap-12 px-page pt-4 pb-10 xl:h-[644px] xl:grid-cols-[590px_560px] xl:justify-between xl:gap-0">
        <div className="flex flex-col gap-[22px]">
          <span className="inline-flex h-8 items-center self-start rounded-full bg-white/10 px-3.5 text-sm font-semibold text-gold-light">
            {t("hero.eyebrow")}
          </span>
          <h1 className="m-0 font-heading text-[34px] leading-[1.35] font-bold md:text-[50px]">{t("hero.title")}</h1>
          <p className="m-0 max-w-[540px] text-lg leading-[1.65] text-white/84">{t("hero.lead")}</p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <Link href={ROUTES.register} className="flex h-[54px] items-center gap-2.5 rounded-xl bg-gold px-6 text-[17px] font-bold text-ink no-underline">
              {t("actions.register")}
              <Icon name="arrowRight" size={20} strokeWidth={2.2} />
            </Link>
            <Link
              href={ROUTES.login}
              className="flex h-[54px] items-center rounded-xl border-[1.5px] border-white/40 px-6 text-[17px] font-semibold text-white no-underline"
            >
              {t("actions.loginLong")}
            </Link>
          </div>
          <ul className="m-0 mt-1.5 flex list-none flex-wrap gap-x-6 gap-y-2.5 p-0 text-[15px] text-white/86">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Icon name="check" size={18} strokeWidth={2.4} className="text-gold-light" />
                {t(`hero.points.${point}`)}
              </li>
            ))}
          </ul>
        </div>

        <HeroPreview />
      </div>
    </div>
  );
}
