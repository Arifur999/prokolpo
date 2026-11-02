import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { budgetPercent, formatAmount, formatPercent } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import type { IProject } from "@/types/project.types";

type MobileOverviewHeaderProps = {
  project: IProject;
  initials: string;
  logoMark: string;
};

// Phones (board Mobile): the green top with the project switcher, the avatar and the spend.
export function MobileOverviewHeader({ project, initials, logoMark }: MobileOverviewHeaderProps) {
  const t = useTranslations("Overview.mobile");
  const tp = useTranslations("Projects");
  const percent = budgetPercent(project.spent, project.budget);

  return (
    <header className="flex flex-col gap-4 bg-brand px-4 pt-2 pb-5 text-white lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href={ROUTES.dashboard} className="flex min-h-12 min-w-0 items-center gap-2.5 text-white no-underline hover:text-white">
          <span
            aria-hidden="true"
            className="flex size-8.5 shrink-0 items-center justify-center rounded-[10px] bg-gold font-heading text-[19px] leading-none font-bold text-brand"
          >
            {logoMark}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] text-white/70">{t(`projectType.${project.ownership}`)}</span>
            <span className="flex items-center gap-1 text-base font-semibold">
              <span className="truncate">{project.name}</span>
              <Icon name="chevronDown" size={16} strokeWidth={2} />
            </span>
          </span>
        </Link>
        <Link
          href={ROUTES.profile}
          aria-label={t("account")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-gold text-sm font-bold text-brand no-underline hover:text-brand"
        >
          {initials}
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm text-white/75">{t("totalSpent")}</span>
            <span className="text-[30px] leading-tight font-bold">৳ {formatAmount(project.spent)}</span>
          </div>
          {percent !== null && (
            <span className="mb-1 rounded-full bg-gold/18 px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap text-gold-light">
              {t("percentChip", { percent: formatPercent(percent) })}
            </span>
          )}
        </div>
        {percent !== null && project.budget !== null && (
          <>
            <div role="img" aria-label={tp("budgetPercent", { percent: formatPercent(percent) })} className="h-2 overflow-hidden rounded-full bg-white/14">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
            <div className="flex justify-between gap-3 text-[13px] text-white/80">
              <span>{t("budget", { amount: formatAmount(project.budget) })}</span>
              <span>{t("remaining", { amount: formatAmount(Math.max(0, project.budget - project.spent)) })}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
