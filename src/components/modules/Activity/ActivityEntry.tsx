"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { activityLine, activityTone, changeRow } from "@/lib/activityText";
import { formatTime } from "@/lib/dhakaTime";
import { nameInitials } from "@/lib/memberLook";
import { cn } from "@/lib/utils";
import type { IActivityItem } from "@/types/members.types";

const TONE: Record<ReturnType<typeof activityTone>, { icon: IconName; look: string }> = {
  CREATE: { icon: "plus", look: "bg-brand-tint text-success" },
  UPDATE: { icon: "pencil", look: "bg-gold-tint text-gold-ink" },
  DELETE: { icon: "trash", look: "bg-danger-tint text-danger" },
};

type ActivityEntryProps = {
  item: IActivityItem;
  avatar: string;
  canRestore: boolean;
  restored: boolean;
  onRestore: () => void;
};

// One line of the timeline (board Activity): time, what kind of change, who did what, and
// for an edit the before/after table; a deleted bill offers to come back.
export function ActivityEntry({ item, avatar, canRestore, restored, onRestore }: ActivityEntryProps) {
  const t = useTranslations("Activity");
  const [expanded, setExpanded] = useState(false);
  const translate = (key: string, values?: Record<string, string | number>) => t(key as Parameters<typeof t>[0], values);
  const line = activityLine(item, translate);
  const tone = TONE[activityTone(item.action)];

  return (
    <li
      className={cn(
        "relative grid grid-cols-[44px_36px_minmax(0,1fr)] gap-3.5 border-b border-line-3 px-5 py-3.5 lg:grid-cols-[52px_36px_minmax(0,1fr)]",
        restored && "bg-brand-wash",
      )}
    >
      <span className="pt-1.75 text-right text-[13px] text-ink-3">{formatTime(new Date(item.createdAt))}</span>
      <span aria-hidden="true" className={cn("flex size-9 items-center justify-center rounded-full", tone.look)}>
        <Icon name={tone.icon} size={18} strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 flex items-start gap-2 text-[15px] leading-[1.55]">
          <span aria-hidden="true" className={cn("mt-px flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", avatar)}>
            {nameInitials(item.actorName)}
          </span>
          <span>
            <strong className="font-bold">{item.actorName}</strong> {line.text}
          </span>
        </p>
        <p className="m-0 ml-8 flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
          <span className="rounded-full bg-surface-4 px-2 font-semibold text-ink-2">{line.area}</span>
          {line.sub}
        </p>
        {item.changes.length > 0 && (
          <div className="ml-8 flex flex-col gap-1.5">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
              className="flex h-7.5 cursor-pointer items-center gap-1 self-start rounded-lg border-none bg-gold-tint px-2.5 text-[13px] font-semibold text-gold-ink"
            >
              {expanded ? t("hideChanges") : t("showChanges")}
              <Icon name="chevronDown" size={14} strokeWidth={2.2} className={cn(expanded && "rotate-180")} />
            </button>
            {expanded && (
              <div
                role="table"
                aria-label={t("changesLabel")}
                className="flex flex-col self-start overflow-hidden rounded-[10px] border border-line-3 text-sm sm:min-w-105"
              >
                <div
                  role="row"
                  className="grid grid-cols-[130px_110px_110px] bg-surface-2 text-[13px] font-semibold text-ink-2 sm:grid-cols-[150px_130px_130px]"
                >
                  <span role="columnheader" className="px-3 py-1.5">
                    {t("colField")}
                  </span>
                  <span role="columnheader" className="px-3 py-1.5">
                    {t("colBefore")}
                  </span>
                  <span role="columnheader" className="px-3 py-1.5">
                    {t("colAfter")}
                  </span>
                </div>
                {item.changes.map((change) => {
                  const row = changeRow(change, translate);
                  return (
                    <div key={change.field} role="row" className="grid grid-cols-[130px_110px_110px] border-t border-line-3 sm:grid-cols-[150px_130px_130px]">
                      <span role="cell" className="px-3 py-1.5 font-medium">
                        {row.label}
                      </span>
                      <span role="cell" className="px-3 py-1.5 text-danger line-through">
                        {row.before}
                      </span>
                      <span role="cell" className="px-3 py-1.5 font-semibold text-success">
                        {row.after}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {canRestore && !restored && (
          <button
            type="button"
            onClick={onRestore}
            className="ml-8 flex h-8 cursor-pointer items-center gap-1.5 self-start rounded-lg border border-brand bg-white px-3 text-[13px] font-semibold text-brand"
          >
            <Icon name="undo" size={14} strokeWidth={2} />
            {t("restore")}
          </button>
        )}
        {restored && (
          <span className="ml-8 inline-flex items-center gap-1.5 self-start rounded-full bg-brand-tint px-2.5 py-0.5 text-[13px] font-semibold text-success">
            <Icon name="check" size={14} strokeWidth={2.2} />
            {t("restored")}
          </span>
        )}
      </div>
    </li>
  );
}
