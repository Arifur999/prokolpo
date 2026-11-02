import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { formatAmount, type BudgetTone } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IProjectSummary } from "@/types/project.types";

type Alert = { icon: IconName; text: string; className: string };

// The one line on a card that needs attention: over budget, nearly there, or work paused.
// A card with nothing to flag shows no line at all.
export function CardAlert({ project, tone }: { project: IProjectSummary; tone: BudgetTone }) {
  const t = useTranslations("Dashboard.card");
  const alert = pickAlert(project, tone, t);
  if (!alert) return null;

  return (
    <p className={cn("m-0 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold", alert.className)}>
      <Icon name={alert.icon} size={16} strokeWidth={2} />
      {alert.text}
    </p>
  );
}

const pickAlert = (project: IProjectSummary, tone: BudgetTone, t: ReturnType<typeof useTranslations<"Dashboard.card">>): Alert | null => {
  if (tone === "over" && project.budget) {
    return { icon: "alertTriangle", text: t("overBudget", { amount: formatAmount(project.spent - project.budget) }), className: "bg-danger-tint text-danger" };
  }
  if (project.status === "ON_HOLD") return { icon: "clock", text: t("onHold"), className: "bg-surface-2 font-medium text-ink-2" };
  if (tone === "near") return { icon: "alertCircle", text: t("nearBudget"), className: "bg-gold-tint text-gold-ink" };
  return null;
};
