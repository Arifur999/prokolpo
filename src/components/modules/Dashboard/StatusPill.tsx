import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project.types";

const STYLE: Record<ProjectStatus, { pill: string; dot: string }> = {
  ACTIVE: { pill: "bg-brand-tint text-success", dot: "bg-brand-mid" },
  ON_HOLD: { pill: "bg-gold-tint text-gold-ink", dot: "bg-gold-strong" },
  DONE: { pill: "bg-surface-4 text-ink-2", dot: "bg-ink-5" },
};

// "● চলমান" next to the ownership badge on a project card.
export function StatusPill({ status }: { status: ProjectStatus }) {
  const t = useTranslations("Projects.status");

  return (
    <span className={cn("box-border flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold", STYLE[status].pill)}>
      <span aria-hidden="true" className={cn("size-1.75 rounded-full", STYLE[status].dot)} />
      {t(status)}
    </span>
  );
}
