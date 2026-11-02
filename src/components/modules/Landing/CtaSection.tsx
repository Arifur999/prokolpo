import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/lib/routes";

const TITLE_ID = "lp-cta-title";

export async function CtaSection() {
  const t = await getTranslations("Landing");

  return (
    <section aria-labelledby={TITLE_ID} className="shrink-0 px-page pt-3 pb-22 xl:h-75">
      <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-4xl bg-brand px-8 py-10 text-white md:flex-row md:items-center md:gap-10 xl:h-50 xl:px-16 xl:py-0">
        <div aria-hidden="true" className="absolute -top-30 -right-20 size-90 rounded-full border border-white/8" />
        <div aria-hidden="true" className="absolute right-30 -bottom-40 size-65 rounded-full bg-gold/10" />
        <div className="relative flex max-w-160 flex-col gap-2">
          <h2 id={TITLE_ID} className="m-0 font-heading text-[26px] leading-[1.35] font-bold md:text-[32px]">
            {t("cta.title")}
          </h2>
          <p className="m-0 text-[17px] text-white/82">{t("cta.body")}</p>
        </div>
        <div className="relative flex shrink-0 flex-wrap gap-3">
          <Link href={ROUTES.register} className="flex h-13.5 items-center rounded-xl bg-gold px-6 text-[17px] font-bold text-ink no-underline">
            {t("actions.register")}
          </Link>
          <Link
            href={ROUTES.login}
            className="flex h-13.5 items-center rounded-xl border-[1.5px] border-white/40 px-5.5 text-[17px] font-semibold text-white no-underline"
          >
            {t("actions.loginLong")}
          </Link>
        </div>
      </div>
    </section>
  );
}
