import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { firstLetter } from "@/lib/initials";
import { displayPhone } from "@/lib/phone";
import type { IProjectSummary } from "@/types/project.types";

const avatar = "flex size-8.5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold";

// Who runs the project: its manager with a phone number, or the owner, who needs no separate
// login (board Dashboard, the box under the title).
export function CardPeople({ project }: { project: IProjectSummary }) {
  const t = useTranslations("Dashboard.card");
  const { manager } = project;

  if (manager) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2.5">
        <span aria-hidden="true" className={`${avatar} bg-brand-tint text-brand`}>
          {firstLetter(manager.name)}
        </span>
        <div className="flex min-w-0 grow flex-col">
          <span className="text-xs text-ink-3">{t("manager")}</span>
          <span className="truncate text-sm font-semibold text-ink">{manager.name}</span>
        </div>
        <span className="flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap text-brand">
          <Icon name="phone" size={14} strokeWidth={2} className="shrink-0" />
          {displayPhone(manager.phone)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gold-cream-line bg-gold-cream px-3 py-2.5">
      <span aria-hidden="true" className={`${avatar} bg-gold text-brand`}>
        {firstLetter(project.ownerName)}
      </span>
      <div className="flex min-w-0 grow flex-col">
        <span className="text-xs text-gold-deep">{t("superOwner")}</span>
        <span className="truncate text-sm font-semibold text-ink">{project.ownerName}</span>
      </div>
      <span className="flex h-6 items-center gap-1.25 rounded-full bg-gold-tint px-2.25 text-xs font-semibold whitespace-nowrap text-gold-ink">
        <Icon name="crown" size={14} strokeWidth={2} className="shrink-0" />
        {t("directAccess")}
      </span>
    </div>
  );
}
