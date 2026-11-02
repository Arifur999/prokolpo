"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PROJECT_STATUSES, type ProjectStatus } from "@/types/project.types";

export type StatusTab = "ALL" | ProjectStatus;

type StatusFilterProps = {
  value: StatusTab;
  counts: Record<StatusTab, number>;
  onChange: (tab: StatusTab) => void;
};

// সব / চলমান / স্থগিত / শেষ with how many projects each holds.
export function StatusFilter({ value, counts, onChange }: StatusFilterProps) {
  const t = useTranslations("Dashboard");
  const tStatus = useTranslations("Projects.status");
  const tabs: StatusTab[] = ["ALL", ...PROJECT_STATUSES];

  return (
    <div role="group" aria-label={t("filterLabel")} className="flex gap-0.5 overflow-x-auto rounded-xl bg-canvas-deep p-1">
      {tabs.map((tab) => {
        const on = tab === value;
        return (
          <button
            key={tab}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(tab)}
            className={cn(
              "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] border-none px-3.5 text-sm",
              on ? "bg-white font-semibold text-ink shadow-tab" : "bg-transparent font-medium text-ink-2",
            )}
          >
            {tab === "ALL" ? t("filterAll") : tStatus(tab)}
            <span className="text-[13px] font-medium text-ink-3">{counts[tab]}</span>
          </button>
        );
      })}
    </div>
  );
}
