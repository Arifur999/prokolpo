"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { formatDate, formatTime } from "@/lib/dhakaTime";
import type { IAdminUserDetail } from "@/types/admin.types";
import { SuspendDialog } from "./SuspendDialog";

// The red line over a suspended account (board AdminUserSuspended): since when, by whom, why,
// with the way to reopen it.
export function SuspendedBanner({ u }: { u: IAdminUserDetail }) {
  const t = useTranslations("AdminUser");
  const [open, setOpen] = useState(false);
  const at = u.suspendedAt ? new Date(u.suspendedAt) : null;
  return (
    <>
      <div role="status" className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-danger-line bg-danger-tint px-4.5 py-3.5 text-danger">
        <Icon name="ban" size={22} strokeWidth={2} />
        <span className="flex grow flex-col">
          <strong className="text-base font-bold">{t("suspendedTitle")}</strong>
          <span className="text-sm text-danger-ink-2">
            {t("suspendedLine", { at: at ? `${formatDate(at)} ${formatTime(at)}` : "", by: u.suspendedBy ?? "", reason: u.suspendedReason ?? "" })}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10.5 shrink-0 cursor-pointer rounded-[10px] border border-success bg-white px-4 text-sm font-semibold text-success"
        >
          {t("unsuspend")}
        </button>
      </div>
      {open && <SuspendDialog u={u} suspend={false} onClose={() => setOpen(false)} />}
    </>
  );
}
