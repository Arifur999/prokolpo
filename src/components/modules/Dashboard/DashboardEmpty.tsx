import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Ownership } from "@/types/project.types";

type StartOption = { ownership: Ownership; icon: IconName; well: string; title: string; body: string; cta: string };

// No projects yet: the two ways to start, and a note that invitations appear here (board DashboardEmpty).
export function DashboardEmpty() {
  const t = useTranslations("Dashboard.empty");
  const options: StartOption[] = [
    { ownership: "PERSONAL", icon: "home", well: "bg-brand-tint text-brand", title: t("personalTitle"), body: t("personalBody"), cta: t("personalCta") },
    { ownership: "PARTNERSHIP", icon: "users", well: "bg-gold-tint text-gold-ink", title: t("jointTitle"), body: t("jointBody"), cta: t("jointCta") },
  ];

  return (
    <section
      aria-labelledby="empty-title"
      className="flex grow flex-col items-center gap-7 rounded-[20px] border border-line-2 bg-white px-6 py-13 text-center sm:px-12"
    >
      <div className="flex flex-col items-center gap-3">
        <span aria-hidden="true" className="relative flex size-22 items-center justify-center rounded-full bg-brand-tint text-brand">
          <Icon name="building" size={40} strokeWidth={1.6} />
          <span className="absolute -right-0.5 -bottom-0.5 flex size-7.5 items-center justify-center rounded-full border-[3px] border-white bg-gold text-brand">
            <Icon name="plus" size={16} strokeWidth={2.8} />
          </span>
        </span>
        <h2 id="empty-title" className="m-0 mt-2 text-2xl leading-[1.4] font-semibold">
          {t("title")}
        </h2>
        <p className="m-0 max-w-140 text-base leading-[1.6] text-ink-2">{t("body")}</p>
      </div>

      <div className="grid w-full max-w-195 grid-cols-1 gap-5 text-left sm:grid-cols-2">
        {options.map((option) => (
          <Link
            key={option.ownership}
            href={`${ROUTES.newProject}?ownership=${option.ownership}`}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5.5 text-ink no-underline hover:border-brand hover:text-ink"
          >
            <span className="flex items-center gap-3">
              <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-[14px]", option.well)}>
                <Icon name={option.icon} size={24} />
              </span>
              <span className="text-lg font-semibold">{option.title}</span>
            </span>
            <span className="text-[15px] leading-[1.6] text-ink-2">{option.body}</span>
            <span className="mt-auto flex items-center gap-1.5 text-[15px] font-semibold text-brand">
              {option.cta}
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </span>
          </Link>
        ))}
      </div>

      <p className="m-0 flex items-center gap-2.5 rounded-xl bg-surface-2 px-4 py-3 text-left text-sm text-ink-2">
        <Icon name="info" size={18} strokeWidth={2} className="text-brand" />
        {t("invited")}
      </p>
    </section>
  );
}
