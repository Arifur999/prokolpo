import { useTranslations } from "next-intl";
import { BudgetBar } from "@/components/shared/BudgetBar";
import { Icon } from "@/components/shared/icon/Icon";
import { budgetPercent, budgetTone, formatAmount, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IProjectPhase } from "@/types/project.types";
import { Panel, PanelEmpty } from "./Panel";

const PERCENT_STYLE = {
  ok: { ink: "text-ink", icon: null },
  near: { ink: "text-gold-ink", icon: "alertCircle" },
  over: { ink: "text-danger", icon: "alertTriangle" },
} as const;

// "তলা অনুযায়ী বাজেট": each phase's spend against its own budget (board Main).
export function PhaseBudgets({ phases, byFloor, className }: { phases: IProjectPhase[]; byFloor: boolean; className?: string }) {
  const t = useTranslations("Overview.phaseBudget");
  const tp = useTranslations("Projects");

  return (
    <Panel title={t(byFloor ? "titleFloors" : "title")} subtitle={t("legend")} className={cn("lg:px-5", className)}>
      {phases.length === 0 ? (
        <PanelEmpty>{t("empty")}</PanelEmpty>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {phases.map((phase) => {
            const percent = budgetPercent(phase.spent, phase.budget);
            const style = PERCENT_STYLE[percent === null ? "ok" : budgetTone(percent)];
            return (
              <li key={phase.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{phase.name}</span>
                  {percent !== null && (
                    <span className={cn("flex items-center gap-1 font-semibold", style.ink)}>
                      {style.icon && <Icon name={style.icon} size={14} strokeWidth={2.2} />}
                      {formatPercent(percent)}
                    </span>
                  )}
                </div>
                {percent !== null && (
                  <BudgetBar
                    percent={percent}
                    label={tp(budgetTone(percent) === "over" ? "budgetPercentOver" : "budgetPercent", { percent: formatPercent(percent) })}
                  />
                )}
                <span className="text-[13px] text-ink-3">
                  {phase.budget
                    ? t("amounts", { spent: formatAmount(phase.spent), budget: formatAmount(phase.budget) })
                    : t("noBudget", { spent: formatAmount(phase.spent) })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
