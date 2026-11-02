"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { cancelInviteAction } from "@/app/(dashboardLayout)/projects/[projectId]/members/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { formatDate } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import type { IInvite } from "@/types/members.types";

type PendingInvitesProps = { projectId: string; projectName: string; invites: IInvite[]; isOwner: boolean };

// "অপেক্ষায় থাকা আমন্ত্রণ": numbers invited before they had an account. The owner copies a
// message to send them, or cancels.
export function PendingInvites({ projectId, projectName, invites, isOwner }: PendingInvitesProps) {
  const t = useTranslations("Members");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const copy = async (invite: IInvite) => {
    const text = t("inviteMessage", {
      project: projectName,
      role: t(`role.${invite.role}`),
      phone: displayPhone(invite.phone),
      link: `${window.location.origin}/register`,
    });
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copied"));
    } catch {
      toast.error(t("failed"));
    }
  };

  const cancel = (invite: IInvite) =>
    startTransition(async () => {
      const result = await cancelInviteAction(projectId, invite.id);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("cancelled"));
      router.refresh();
    });

  return (
    <section aria-labelledby="pd-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-2 px-5 py-4">
        <h2 id="pd-title" className="m-0 flex items-center gap-2 text-[17px] font-semibold">
          {t("pendingTitle")}
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-tint px-1.75 text-[13px] font-bold text-gold-ink">{invites.length}</span>
        </h2>
        <span className="text-[13px] text-ink-3">{t("pendingNote")}</span>
      </div>
      {invites.map((invite) => (
        <div key={invite.id} className="flex flex-wrap items-center gap-3.5 border-b border-line-3 px-5 py-3.5">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-line-strong text-ink-3">
            <Icon name="smartphone" size={18} strokeWidth={2} />
          </span>
          <span className="flex min-w-0 grow flex-col">
            <span className="text-[15px] font-semibold">
              {displayPhone(invite.phone)} <span className="font-medium text-ink-2">· {t(`role.${invite.role}`)}</span>
            </span>
            <span className="text-[13px] text-ink-3">{t("pendingSub", { by: invite.invitedBy, date: formatDate(new Date(invite.createdAt)) })}</span>
          </span>
          {isOwner && (
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => void copy(invite)}
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[9px] border border-line bg-white px-3 text-sm font-semibold whitespace-nowrap text-ink"
              >
                <Icon name="copy" size={16} strokeWidth={2} />
                {t("copyMessage")}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => cancel(invite)}
                className="h-9 cursor-pointer rounded-[9px] border border-danger-line bg-white px-3 text-sm font-semibold text-danger"
              >
                {t("cancel")}
              </button>
            </span>
          )}
        </div>
      ))}
      {invites.length === 0 && <p className="m-0 p-5 text-sm text-ink-3">{t("noPending")}</p>}
    </section>
  );
}
