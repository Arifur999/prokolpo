import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ROUTES } from "@/lib/routes";
import { LANDING_SECTIONS } from "./landingSections";

export async function LandingHeader() {
  const t = await getTranslations("Landing");

  return (
    <header className="relative flex h-[76px] items-center gap-7 px-page">
      <BrandLogo />
      <nav aria-label={t("nav.label")} className="hidden gap-1 lg:flex">
        {LANDING_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex h-10 items-center rounded-lg px-3 text-[15px] font-medium text-white/84 no-underline hover:bg-white/10"
          >
            {t(`nav.${section.navKey}`)}
          </a>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2.5">
        <LanguageToggle
          label={t("actions.switchLanguage")}
          className="hidden h-11 items-center gap-2 rounded-full border border-white/30 pr-4 pl-3.5 text-[15px] font-semibold text-white sm:flex"
          iconClassName="text-gold-light"
        />
        <Link href={ROUTES.login} className="flex h-11 items-center px-3.5 text-[15px] font-semibold text-white no-underline">
          {t("actions.login")}
        </Link>
        <Link href={ROUTES.register} className="flex h-11 items-center rounded-xl bg-gold px-5 text-[15px] font-bold text-ink no-underline">
          {t("actions.register")}
        </Link>
      </div>
    </header>
  );
}
