import { useTranslations } from "next-intl";
import { budgetPercent, formatAmount, formatPercent } from "@/lib/money";
import type { IProject } from "@/types/project.types";

type BudgetHeroProps = {
  project: IProject;
  greeting: string;
  startedOn: string;
};

// The green banner: where and since when, a greeting, and how much of the budget is gone (board Main).
export function BudgetHero({ project, greeting, startedOn }: BudgetHeroProps) {
  const t = useTranslations("Overview.hero");
  const tp = useTranslations("Projects");
  const percent = budgetPercent(project.spent, project.budget);
  const place = [project.location, t("started", { date: startedOn })].filter(Boolean).join(" · ");

  return (
    <section
      aria-label={t("label")}
      className="relative hidden items-center justify-between gap-12 overflow-hidden rounded-[20px] bg-brand px-8 py-7 text-white lg:flex"
    >
      <div aria-hidden="true" className="absolute -top-32.5 -right-22.5 box-border size-80 rounded-full border-48 border-white/4" />
      <div className="relative flex flex-col gap-1.5">
        <span className="text-sm text-white/75">{place}</span>
        <h2 className="m-0 font-heading text-[30px] leading-[1.4] font-bold">{greeting}</h2>
        <p className="m-0 text-[15px] text-white/80">{t("subtitle")}</p>
      </div>
      <div className="relative box-border flex w-120 shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/6 px-5 py-4.5">
        {percent === null ? (
          <p className="m-0 text-[15px] text-white/80">{t("noBudget")}</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-white/80">{t("budgetUsed")}</span>
              <span className="text-[28px] leading-[1.1] font-bold text-gold-light">{formatPercent(percent)}</span>
            </div>
            <div role="img" aria-label={tp("budgetPercent", { percent: formatPercent(percent) })} className="h-2.5 overflow-hidden rounded-full bg-white/14">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span>
                <span className="text-white/72">{t("spent")} </span>
                <strong className="font-semibold">৳ {formatAmount(project.spent)}</strong>
              </span>
              <span>
                <span className="text-white/72">{t("budget")} </span>
                <strong className="font-semibold">৳ {formatAmount(project.budget ?? 0)}</strong>
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
