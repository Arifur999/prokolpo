"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { grantSupportAction, revokeSupportAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { formatDateTime } from "@/lib/dhakaTime";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ISupportGrant } from "@/types/settings.types";
import { ActionCard } from "./SettingsCard";
import { useSettingsSave } from "./useSettingsSave";

const HOURS = [24, 72, 168] as const;
const HOUR = 3_600_000;

// "সাপোর্টকে দেখার অনুমতি" (boards SettingsSupport, SettingsSupportGrant): a read-only window
// for platform support, opened for a set time and closed early at will.
export function SupportCard({ projectId, grant, canEdit, now }: { projectId: string; grant: ISupportGrant | null; canEdit: boolean; now: string }) {
  const t = useTranslations("Settings.support");
  const [hours, setHours] = useState<(typeof HOURS)[number]>(24);
  const { run, isPending } = useSettingsSave();
  const at = Date.parse(now);
  const untilFor = (h: number) => formatDateTime(new Date(at + h * HOUR));
  const left = grant ? Math.max(0, Date.parse(grant.endsAt) - at) : 0;
  const leftText = left >= 24 * HOUR ? t("leftDays", { count: Math.ceil(left / (24 * HOUR)) }) : t("leftHours", { count: Math.max(1, Math.ceil(left / HOUR)) });

  return (
    <ActionCard
      id="st-support"
      tone={grant ? "gold" : "plain"}
      title={t("title")}
      body={t("body")}
      action={
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-0.75 text-[13px] font-bold",
            grant ? "bg-gold-tint text-gold-ink" : "bg-surface-4 text-ink-2",
          )}
        >
          <span aria-hidden="true" className={cn("size-1.75 rounded-full", grant ? "bg-gold-ink" : "bg-ink-2")} />
          {grant ? t("on") : t("off")}
        </span>
      }
    >
      {grant ? (
        <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-gold-border bg-gold-wash px-4 py-3.5 text-gold-deep">
          <Icon name="eye" size={22} strokeWidth={2} />
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="text-[15px] font-bold text-gold-darkest">{t("until", { until: formatDateTime(new Date(grant.endsAt)) })}</span>
            <span className="text-[13px]">{t("since", { name: grant.grantedBy, at: formatDateTime(new Date(grant.startsAt)), left: leftText })}</span>
            <span className="text-[13px]">
              {grant.lastOpenedBy && grant.lastOpenedAt
                ? t("lastOpened", { name: grant.lastOpenedBy, at: formatDateTime(new Date(grant.lastOpenedAt)) })
                : t("notOpened")}{" "}
              ·{" "}
              <Link href={projectHref(projectId, "activity")} className="font-semibold text-gold-deep">
                {t("activity")}
              </Link>
            </span>
          </span>
          {canEdit && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => revokeSupportAction(projectId), t("revoked"))}
              className="h-10 shrink-0 cursor-pointer rounded-lg border border-danger-line bg-white px-3.5 text-sm font-semibold text-danger"
            >
              {t("revoke")}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-sm text-ink-2">{t("offNote")}</span>
          {canEdit && (
            <>
              <div role="radiogroup" aria-label={t("howLong")} className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    role="radio"
                    aria-checked={hours === h}
                    onClick={() => setHours(h)}
                    className={cn(
                      "flex cursor-pointer flex-col items-start gap-0.5 rounded-xl px-3.5 py-2.5 text-left text-ink",
                      hours === h ? "border-[1.5px] border-brand bg-brand-wash" : "border border-line bg-white",
                    )}
                  >
                    <span className="text-[15px] font-bold">{t(`durations.${h}`)}</span>
                    <span className="text-xs text-ink-3">{t("durationUntil", { until: untilFor(h) })}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => grantSupportAction(projectId, hours), t("granted", { duration: t(`durations.${hours}`), until: untilFor(hours) }))}
                  className="h-11 cursor-pointer rounded-lg border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
                >
                  {t("grant", { duration: t(`durations.${hours}`) })}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <ul className="m-0 rounded-lg bg-surface-2 py-2.5 pr-3 pl-7 text-[13px] leading-[1.7] text-ink-2">
        <li>{t("rules.read")}</li>
        <li>{t("rules.logged")}</li>
        <li>{t("rules.ends")}</li>
      </ul>
    </ActionCard>
  );
}
