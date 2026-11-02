"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkMaintenanceAction } from "@/app/maintenance/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { formatClock } from "@/lib/dhakaTime";
import { ROUTES } from "@/lib/routes";

type MaintenanceRetryProps = {
  // Both languages show together on this page, so the copy comes in already resolved.
  label: { bn: string; en: string };
  checked: { bn: string; en: string };
};

const fill = (template: string, time: string) => template.replace("{time}", time);

export function MaintenanceRetry({ label, checked }: MaintenanceRetryProps) {
  const router = useRouter();
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  const retry = () =>
    startTransition(async () => {
      const result = await checkMaintenanceAction();
      if (result.isOver) router.replace(ROUTES.home);
      else setCheckedAt(new Date(result.checkedAt));
    });

  return (
    <>
      <button
        type="button"
        onClick={retry}
        disabled={isPending}
        className="flex h-12.5 cursor-pointer items-center gap-2.5 rounded-xl border-none bg-brand px-5.5 text-base font-semibold text-white disabled:cursor-progress"
      >
        <Icon name="refresh" size={18} strokeWidth={2} className={isPending ? "animate-spin" : undefined} />
        {label.bn}
        <span lang="en" className="font-medium opacity-80">
          · {label.en}
        </span>
      </button>
      {checkedAt && (
        <p role="status" className="m-0 -mt-1.5 text-sm leading-[1.55] text-gold-ink">
          {fill(checked.bn, formatClock(checkedAt, "bn"))}
          <br />
          <span lang="en" className="text-ink-3">
            {fill(checked.en, formatClock(checkedAt, "en"))}
          </span>
        </p>
      )}
    </>
  );
}
