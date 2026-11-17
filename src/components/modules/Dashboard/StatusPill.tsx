import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { IProjectSummary } from "@/types/project.types";

type CardStatus = IProjectSummary["status"] | "NEW";

const STYLE: Record<CardStatus, { pill: string; dot: string }> = {
  NEW: { pill: "bg-gold font-bold text-ink", dot: "bg-brand" },
  ACTIVE: { pill: "bg-brand-tint font-semibold text-success", dot: "bg-brand-mid" },
  ON_HOLD: { pill: "bg-gold-tint font-semibold text-gold-ink", dot: "bg-gold-strong" },
  DONE: { pill: "bg-surface-4 font-semibold text-ink-2", dot: "bg-ink-5" },
};

// "● চলমান" at the top right of a project card. A running project nobody has spent on or paid
// into yet reads "নতুন" instead.
export function StatusPill({ project }: { project: IProjectSummary }) {
  const t = useTranslations("Dashboard.card.status");
  const status: CardStatus = project.isNew && project.status === "ACTIVE" ? "NEW" : project.status;

  return (
    <span className={cn("box-border flex h-6 items-center gap-1.5 rounded-full px-2.25 text-xs", STYLE[status].pill)}>
      <span aria-hidden="true" className={cn("size-1.75 rounded-full", STYLE[status].dot)} />
      {t(status)}
    </span>
  );
}
