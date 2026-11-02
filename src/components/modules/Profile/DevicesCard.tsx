"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { endDeviceAction, endOtherDevicesAction } from "@/app/(dashboardLayout)/(home)/profile/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { deviceLabel } from "@/lib/deviceLabel";
import { cn } from "@/lib/utils";
import { whenText } from "@/lib/whenText";
import type { IDevice } from "@/types/account.types";
import { ProfileCard } from "./ProfileCard";

// This device and the most recent others; the rest open on request.
const SHOWN = 5;

// "যেখানে লগইন করা আছে" (board Profile): every open login, this one marked, the others
// each with its own logout.
export function DevicesCard({ devices, now }: { devices: IDevice[]; now: string }) {
  const t = useTranslations("Profile.devices");
  const translate = (key: string, values?: Record<string, string>) => t(key as Parameters<typeof t>[0], values);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);
  const others = devices.filter((d) => !d.current).length;
  const listed = showAll ? devices : devices.slice(0, SHOWN);

  const run = (action: () => Promise<{ success: boolean; message: string }>, done: string) =>
    startTransition(async () => {
      const result = await action();
      if (!result.success) return void toast.error(result.message);
      toast.success(done);
      router.refresh();
    });

  return (
    <ProfileCard
      id="pf-dev"
      title={t("title")}
      sub={t("sub")}
      aside={
        <button
          type="button"
          onClick={() => run(endOtherDevicesAction, t("endedAll", { count: others }))}
          disabled={!others || isPending}
          className={cn(
            "h-9.5 rounded-[10px] border bg-white px-3.5 text-sm font-semibold",
            others ? "cursor-pointer border-danger-strong text-danger" : "cursor-not-allowed border-line text-ink-5",
          )}
        >
          {t("endAll")}
        </button>
      }
    >
      <ul className="m-0 list-none p-0">
        {listed.map((d) => {
          const label = deviceLabel(d.userAgent, translate);
          const when = d.current ? t("activeNow") : whenText(d.lastSeen, now, t, true);
          return (
            <li key={d.id} className="flex items-center gap-3.5 border-b border-line-3 px-5.5 py-3 last:border-b-0">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-4 text-ink-2">
                <Icon name={label.kind === "pc" ? "dashboard" : "smartphone"} size={20} strokeWidth={2} />
              </span>
              <span className="flex min-w-0 grow flex-col">
                <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                  {label.name}
                  {d.current && <span className="rounded-full bg-brand-tint px-2 text-xs font-bold text-success">{t("thisDevice")}</span>}
                </span>
                <span className="text-[13px] text-ink-3">{[d.ip, when].filter(Boolean).join(" · ")}</span>
              </span>
              {!d.current && (
                <button
                  type="button"
                  aria-label={t("endOneLabel", { name: label.name })}
                  onClick={() => run(() => endDeviceAction(d.id), t("endedOne", { name: label.name }))}
                  disabled={isPending}
                  className="h-8.5 cursor-pointer rounded-[9px] border border-line bg-white px-3 text-[13px] font-semibold text-danger"
                >
                  {t("endOne")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {devices.length > SHOWN && (
        <button
          type="button"
          onClick={() => setShowAll((all) => !all)}
          className="h-11 cursor-pointer border-x-0 border-t border-b-0 border-line-3 bg-surface-3 text-sm font-semibold text-brand"
        >
          {showAll ? t("less") : t("more", { count: devices.length - SHOWN })}
        </button>
      )}
    </ProfileCard>
  );
}
