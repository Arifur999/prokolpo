"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { SETTINGS_TABS, type SettingsTab } from "@/lib/settingsTabs";
import { cn } from "@/lib/utils";
import type { ISettings } from "@/types/settings.types";
import { BackupCard } from "./BackupCard";
import { CategoriesTab } from "./CategoriesTab";
import { DeleteProjectCard } from "./DeleteProjectCard";
import { GeneralTab } from "./GeneralTab";
import { PhasesTab } from "./PhasesTab";
import { ReceiptTab } from "./ReceiptTab";
import { SupportCard } from "./SupportCard";
import { TransferCard } from "./TransferCard";

type SettingsViewProps = { projectId: string; settings: ISettings; tab: SettingsTab; now: string; today: string };

// Board Settings: the tab rail on the left, the chosen tab on the right. The tab lives in
// ?tab= so a link or a refresh lands on the same one.
export function SettingsView({ projectId, settings, tab, now, today }: SettingsViewProps) {
  const t = useTranslations("Settings");
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const canEdit = settings.role === "OWNER";
  const name = settings.general.name;
  const pick = (next: SettingsTab) => {
    const params = new URLSearchParams(query);
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-ink-2">{name}</span>
          <h1 className="m-0 text-[28px] leading-[1.3] font-semibold">{t("title")}</h1>
          <p className="m-0 text-[15px] text-ink-2">{t("intro")}</p>
        </div>
        <span
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
            canEdit ? "bg-brand-tint text-brand" : "bg-surface-4 text-ink-2",
          )}
        >
          <Icon name={canEdit ? "crown" : "eye"} size={16} strokeWidth={2} />
          {canEdit ? t("youOwn") : t("readOnly")}
        </span>
      </header>

      <div className="grid grid-cols-1 items-start gap-5.5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={t("navLabel")} className="flex overflow-x-auto rounded-2xl border border-line-2 bg-white lg:flex-col lg:overflow-hidden">
          {SETTINGS_TABS.map((key) => {
            const on = key === tab;
            return (
              <button
                key={key}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => pick(key)}
                className={cn(
                  "flex shrink-0 cursor-pointer flex-col items-start border-none border-line-3 py-3 pr-3.5 pl-4 text-left lg:border-b",
                  on ? "bg-brand-wash" : "bg-white",
                  on && (key === "danger" ? "shadow-[inset_3px_0_0_var(--color-danger-strong)]" : "shadow-[inset_3px_0_0_var(--color-brand)]"),
                  key === "danger" ? "text-danger" : "text-ink",
                )}
              >
                <span className={cn("text-[15px]", on ? "font-bold" : "font-semibold")}>{t(`tabs.${key}.label`)}</span>
                <span className="text-xs text-ink-3">{t(`tabs.${key}.sub`)}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-col gap-4.5">
          {tab === "general" && <GeneralTab projectId={projectId} general={settings.general} canEdit={canEdit} />}
          {tab === "phases" && <PhasesTab key={JSON.stringify(settings.phases)} projectId={projectId} phases={settings.phases} canEdit={canEdit} />}
          {tab === "categories" && <CategoriesTab projectId={projectId} categories={settings.categories} canEdit={canEdit} />}
          {tab === "receipt" && <ReceiptTab projectId={projectId} projectName={name} receipt={settings.receipt} canEdit={canEdit} today={today} />}
          {tab === "danger" && (
            <>
              <SupportCard projectId={projectId} grant={settings.support} canEdit={canEdit} now={now} />
              {canEdit && (
                <>
                  <BackupCard projectId={projectId} projectName={name} today={today} />
                  <TransferCard projectId={projectId} members={settings.members} />
                  <DeleteProjectCard projectId={projectId} projectName={name} counts={settings.counts} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
