"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { AMOUNT_TONE_CLASS, CHIP_TONE_CLASS, PREVIEW_KINDS, PREVIEW_LOOKS, PREVIEW_ROWS, RECENT_ROWS, type PreviewKind } from "./heroPreviews";

const PANEL_ID = "lp-preview";

export function HeroPreview() {
  const t = useTranslations("Landing.preview");
  const [kind, setKind] = useState<PreviewKind>("building");
  const look = PREVIEW_LOOKS[kind];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/74">{t("heading")}</span>
        <div role="tablist" aria-label={t("tabsLabel")} className="flex gap-1 rounded-full bg-white/10 p-1">
          {PREVIEW_KINDS.map((tab) => {
            const isActive = tab === kind;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={PANEL_ID}
                onClick={() => setKind(tab)}
                className={cn(
                  "h-9 cursor-pointer rounded-full px-4 text-sm",
                  isActive ? "bg-white font-bold text-brand" : "bg-transparent font-medium text-white/84",
                )}
              >
                {t(`${tab}.tab`)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-label={t("panelLabel", { name: t(`${kind}.name`) })}
        className="flex flex-col overflow-hidden rounded-[18px] bg-white text-ink shadow-hero"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line-3 px-5 py-3.5">
          <span className="flex min-w-0 flex-col">
            <span className="text-xs text-ink-3">{t(`${kind}.line`)}</span>
            <span className="text-lg leading-[1.35] font-bold">{t(`${kind}.name`)}</span>
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-semibold",
              look.isJoint ? "bg-brand-tint text-brand" : "bg-surface-4 text-ink-2",
            )}
          >
            {t(`${kind}.badge`)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 px-5 py-3.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-ink-2">{t(`${kind}.label`)}</span>
            <span className="text-[13px] text-ink-3">{t(`${kind}.of`)}</span>
          </span>
          <span className="flex items-baseline gap-2.5">
            <strong className="text-[26px] leading-[1.2] font-bold">{t(`${kind}.big`)}</strong>
            {look.spentPercent !== null && <span className="text-sm font-semibold text-success">{look.spentPercent}%</span>}
          </span>
          {look.spentPercent !== null && (
            <span aria-hidden="true" className="flex h-2 overflow-hidden rounded-full bg-line-3">
              <span className="rounded-full bg-brand-mid" style={{ width: `${look.spentPercent}%` }} />
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 px-5 pb-3.5">
          {PREVIEW_ROWS.map((row) => (
            <span key={row} className="flex flex-col gap-0.5 rounded-xl bg-surface-2 px-3 py-2.5">
              <span className="text-xs text-ink-3">{t(`${kind}.stats.${row}.label`)}</span>
              <strong className={cn("text-base font-bold", AMOUNT_TONE_CLASS[look.statTones[row]])}>{t(`${kind}.stats.${row}.value`)}</strong>
            </span>
          ))}
        </div>

        <div className="flex flex-col border-t border-line-3">
          <span className="px-5 pt-2.5 pb-0.5 text-[13px] font-semibold text-ink-2">{t(`${kind}.recentTitle`)}</span>
          {RECENT_ROWS.map((row) => (
            <div key={row} className="flex items-center gap-3 border-b border-surface-4 px-5 py-[9px]">
              <span className="flex min-w-0 grow flex-col">
                <span className="text-sm font-semibold">{t(`${kind}.recent.${row}.title`)}</span>
                <span className="text-xs text-ink-3">{t(`${kind}.recent.${row}.sub`)}</span>
              </span>
              <span className={cn("shrink-0 rounded-full px-2 py-px text-xs font-semibold", CHIP_TONE_CLASS[look.recent[row].chip])}>
                {t(`${kind}.recent.${row}.chip`)}
              </span>
              <strong className={cn("w-[108px] shrink-0 text-right text-[15px] font-bold", AMOUNT_TONE_CLASS[look.recent[row].amount])}>
                {t(`${kind}.recent.${row}.amount`)}
              </strong>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 bg-brand-wash px-5 py-3 text-sm font-semibold text-success">
          <Icon name="checkCircle" size={18} strokeWidth={2} />
          {t(`${kind}.note`)}
        </div>
      </div>
    </div>
  );
}
