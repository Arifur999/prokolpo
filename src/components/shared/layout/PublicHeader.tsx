import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ROUTES } from "@/lib/routes";

// The white top bar of public pages that are not the landing page (board Terms).
export async function PublicHeader() {
  const t = await getTranslations("PublicHeader");
  const common = await getTranslations("Common");

  return (
    <header className="flex h-17 shrink-0 items-center justify-between border-b border-line-2 bg-white px-page">
      <Link href={ROUTES.home} aria-label={t("homeLabel")} className="flex items-center gap-2.5 no-underline">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-[11px] bg-gold font-heading text-xl leading-none font-bold text-brand"
        >
          {common("logoMark")}
        </span>
        <span className="font-heading text-[21px] font-bold text-brand">{common("appName")}</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href={ROUTES.support} className="hidden px-2 text-[15px] font-semibold no-underline md:inline">
          {t("support")}
        </Link>
        <LanguageToggle
          label={t("switchLanguage")}
          className="hidden h-11 items-center gap-2 rounded-full border border-line bg-white pr-4 pl-3.5 text-[15px] font-semibold text-ink sm:flex"
          iconClassName="text-brand"
        />
        <Link
          href={ROUTES.login}
          className="flex h-11 items-center rounded-lg border border-line px-4 text-[15px] font-semibold text-ink no-underline hover:text-ink"
        >
          {t("login")}
        </Link>
        <Link
          href={ROUTES.register}
          className="flex h-11 items-center rounded-lg bg-brand px-4 text-[15px] font-semibold text-white no-underline hover:text-white"
        >
          {t("register")}
        </Link>
      </div>
    </header>
  );
}
