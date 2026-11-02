import Link from "next/link";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ROUTES } from "@/lib/routes";
import { LANDING_SECTIONS } from "./landingSections";

const LINK = "text-white/78 no-underline hover:text-white";

function FooterNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="flex flex-col items-start gap-2 text-[15px]">
      <span className="mb-1 text-sm font-bold text-white">{label}</span>
      {children}
    </nav>
  );
}

export async function LandingFooter() {
  const t = await getTranslations("Landing");
  const common = await getTranslations("Common");

  return (
    <footer className="flex grow flex-col justify-between gap-9 bg-brand-deep px-page pt-14 pb-9 text-white/78">
      <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_190px_190px_230px]">
        <div className="flex flex-col gap-3.5">
          <BrandLogo className="text-white" />
          <p className="m-0 max-w-95 text-[15px] leading-[1.6]">{t("footer.blurb")}</p>
        </div>
        <FooterNav label={t("footer.app")}>
          {LANDING_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className={LINK}>
              {t(`nav.${section.navKey}`)}
            </a>
          ))}
        </FooterNav>
        <FooterNav label={t("footer.account")}>
          <Link href={ROUTES.login} className={LINK}>
            {t("actions.login")}
          </Link>
          <Link href={ROUTES.register} className={LINK}>
            {t("actions.register")}
          </Link>
          <Link href={ROUTES.forgotPassword} className={LINK}>
            {t("footer.forgotPassword")}
          </Link>
        </FooterNav>
        <FooterNav label={t("footer.other")}>
          <Link href={ROUTES.support} className={LINK}>
            {t("footer.support")}
          </Link>
          <Link href={ROUTES.terms} className={LINK}>
            {t("footer.terms")}
          </Link>
          <LanguageToggle label={t("actions.switchLanguage")} withIcon={false} className={`border-none bg-transparent p-0 text-[15px] ${LINK}`} />
        </FooterNav>
      </div>
      <div className="flex flex-wrap justify-between gap-5 border-t border-white/12 pt-5 text-sm text-white/60">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span>{common("appTagline")}</span>
      </div>
    </footer>
  );
}
