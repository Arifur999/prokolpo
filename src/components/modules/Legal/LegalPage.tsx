import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/shared/icon/Icon";
import { getLegalContent } from "@/content/legal";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { LegalSections } from "./LegalSections";

// The date shown under the title; bump it whenever content/legal changes.
const LAST_CHANGED = "01/10/2026";

type Part = "terms" | "privacy";

// Terms and privacy are one page with two tabs (boards Terms, TermsPrivacy); each tab is its own URL.
export async function LegalPage({ part }: { part: Part }) {
  const t = await getTranslations("Legal");
  const content = getLegalContent(await getLocale());
  const sections = content[part];

  return (
    <main id="main-content" className="flex grow flex-col gap-6.5 px-page pt-10 pb-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-190 flex-col gap-1">
          <h1 className="m-0 font-heading text-[28px] leading-[1.35] font-bold md:text-[34px]">{t("title")}</h1>
          <p className="m-0 text-base leading-[1.6] text-ink-2">{t("lead", { date: LAST_CHANGED })}</p>
        </div>
        <nav aria-label={t("tabsLabel")} className="flex gap-0.5 rounded-xl bg-canvas-deep p-1">
          {(["terms", "privacy"] as const).map((tab) => {
            const isCurrent = tab === part;
            return (
              <Link
                key={tab}
                href={tab === "terms" ? ROUTES.terms : ROUTES.privacy}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center rounded-[9px] px-4.5 text-[15px] no-underline",
                  isCurrent ? "bg-white font-bold text-ink shadow-segment hover:text-ink" : "font-medium text-ink-2 hover:text-ink",
                )}
              >
                {t(tab)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label={t("tocLabel")} className="flex flex-col gap-0.5 rounded-2xl border border-line-2 bg-white p-3.5 lg:sticky lg:top-6">
          <span className="px-2.5 pt-0.5 pb-2 text-[13px] font-semibold text-ink-3">{t("tocLabel")}</span>
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex gap-2 rounded-md px-2.5 py-[7px] text-sm text-ink no-underline hover:bg-surface-4 hover:text-ink"
            >
              <span className="w-4.5 shrink-0 font-bold text-brand">{index + 1}</span>
              {section.title}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-5">
          {part === "privacy" && (
            <section aria-labelledby="pv-sum" className="flex flex-col gap-3.5 rounded-2xl bg-brand px-6.5 py-5.5 text-white">
              <h2 id="pv-sum" className="m-0 text-lg font-semibold">
                {t("summary")}
              </h2>
              <ul className="m-0 grid list-none gap-x-6 gap-y-3 p-0 md:grid-cols-2">
                {content.privacyPromises.map((promise) => (
                  <li key={promise} className="flex items-start gap-2.5 text-[15px] leading-[1.55]">
                    <span aria-hidden="true" className="mt-px flex size-5.5 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                      <Icon name="check" size={14} strokeWidth={2.6} />
                    </span>
                    {promise}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <LegalSections sections={sections} />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line-2 bg-white px-5.5 py-4">
            <span className="text-[15px] text-ink-2">{t("questions")}</span>
            <span className="flex gap-2.5">
              <Link
                href={ROUTES.support}
                className="flex h-10.5 items-center rounded-lg border border-line px-4 text-[15px] font-semibold text-ink no-underline hover:text-ink"
              >
                {t("support")}
              </Link>
              <Link
                href={ROUTES.register}
                className="flex h-10.5 items-center rounded-lg bg-brand px-4 text-[15px] font-semibold text-white no-underline hover:text-white"
              >
                {t("backToRegister")}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
