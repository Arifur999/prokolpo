import { useTranslations } from "next-intl";
import { BudgetBar } from "@/components/shared/BudgetBar";
import { budgetPercent, formatAmount, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IProjectSummary } from "@/types/project.types";

// The thin budget bar at the foot of a card: how much of the budget is spent on the left, the
// money in hand (deposited − spent) on the right.
export function CardProgress({ project }: { project: IProjectSummary }) {
  const t = useTranslations("Dashboard.card");
  const percent = budgetPercent(project.spent, project.budget);
  const available = project.deposited - project.spent;
  const untouched = project.spent === 0 && project.deposited === 0;

  let left = t("noBudget");
  let barLabel = t("noBudget");
  if (untouched) {
    left = t("noTransactions");
    barLabel = t("nothingSpent");
  } else if (percent !== null) {
    left = t("percentSpent", { percent: formatPercent(percent) });
    barLabel = t("percentAria", { percent: formatPercent(percent) });
  }

  let right = t("available", { amount: formatAmount(available) });
  if (untouched) right = t("setBudgetInside");
  else if (available < 0) right = t("shortfall", { amount: formatAmount(-available) });

  return (
    <div className="mt-auto flex flex-col gap-1.5">
      <BudgetBar percent={untouched ? 0 : (percent ?? 0)} label={barLabel} className="h-1.5" />
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-ink-3">{left}</span>
        <span className={cn("text-right font-semibold", untouched ? "text-ink-3" : available < 0 ? "text-danger" : "text-success")}>{right}</span>
      </div>
    </div>
  );
}
