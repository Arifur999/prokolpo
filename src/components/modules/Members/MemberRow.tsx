"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { changeRoleAction, removeMemberAction } from "@/app/(dashboardLayout)/projects/[projectId]/members/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { formatDate } from "@/lib/dhakaTime";
import { lastActive, nameInitials, ROLE_AVATAR } from "@/lib/memberLook";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IMember, TeamRole } from "@/types/members.types";

type MemberRowProps = {
  projectId: string;
  member: IMember;
  isOwner: boolean;
  confirming: boolean;
  onAskRemove: (ask: boolean) => void;
  onReset: () => void;
};

export const MEMBER_GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_168px_120px_88px_84px] lg:items-center";

// One person on the team (board Members): who, role (the owner can change it), last seen,
// entries this month, and the owner's reset-code and remove buttons.
export function MemberRow({ projectId, member: m, isOwner, confirming, onAskRemove, onReset }: MemberRowProps) {
  const t = useTranslations("Members");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canChange = isOwner && m.role !== "OWNER";
  const seen = lastActive(m.lastActive);
  const seenText =
    seen.kind === "online" ? t("online") : seen.kind === "today" ? t("today", { time: seen.time }) : seen.kind === "date" ? seen.date : t("never");

  const run = (action: () => ReturnType<typeof removeMemberAction>, done: string) =>
    startTransition(async () => {
      const result = await action();
      if (!result.success) return void toast.error(result.message);
      toast.success(done);
      router.refresh();
    });

  const changeRole = (role: TeamRole) =>
    run(() => changeRoleAction(projectId, m.userId, role), t("roleChanged", { name: m.name, role: t(`role.${role}`) }));

  return (
    <div role="row" aria-busy={isPending} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-3 px-5 py-3 lg:min-h-17 lg:gap-x-0 lg:py-0", MEMBER_GRID)}>
      <span role="cell" className="flex min-w-0 grow items-center gap-3 lg:grow-0">
        <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", ROLE_AVATAR[m.role])}>
          {nameInitials(m.name)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-[15px] font-semibold">
            <span className="truncate">{m.name}</span>
            {m.isYou && <span className="rounded-full bg-surface-4 px-1.75 text-xs font-semibold text-ink-2">{t("you")}</span>}
          </span>
          <span className="text-[13px] text-ink-3">{t("sub", { phone: displayPhone(m.phone), date: formatDate(new Date(m.joinedAt)) })}</span>
        </span>
      </span>
      <span role="cell">
        {m.role === "OWNER" ? (
          <span className="inline-flex items-center gap-1.5 rounded-[9px] bg-brand-tint px-2.5 py-1 text-sm font-semibold text-brand">
            <Icon name="crown" size={15} strokeWidth={2} />
            {t("role.OWNER")}
          </span>
        ) : canChange ? (
          <span className="relative inline-block">
            <label htmlFor={`role-${m.userId}`} className="sr-only">
              {t("roleLabel", { name: m.name })}
            </label>
            <select
              id={`role-${m.userId}`}
              value={m.role}
              disabled={isPending}
              onChange={(event) => changeRole(event.target.value as TeamRole)}
              className="h-9.5 w-37 cursor-pointer appearance-none rounded-[9px] border border-line bg-white pr-8 pl-3 text-sm font-semibold text-ink outline-none"
            >
              <option value="MANAGER">{t("role.MANAGER")}</option>
              <option value="VIEWER">{t("role.VIEWER")}</option>
            </select>
            <Icon name="chevronDown" size={16} strokeWidth={2} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-3" />
          </span>
        ) : (
          <span className="text-sm font-semibold text-ink-2">{t(`role.${m.role}`)}</span>
        )}
      </span>
      <span role="cell" className="flex items-center gap-1.5 text-sm text-ink-2">
        <span aria-hidden="true" className={cn("size-1.75 rounded-full", seen.kind === "online" || seen.kind === "today" ? "bg-brand-mid" : "bg-line-strong")} />
        {seenText}
      </span>
      <span role="cell" className="text-[15px] font-semibold lg:pr-2 lg:text-right">
        <span className="text-[13px] font-normal text-ink-3 lg:hidden">{t("colEntries")}: </span>
        {m.entries}
      </span>
      <span role="cell" className="ml-auto flex justify-end">
        {canChange && (
          <span className="flex gap-1.5">
            <button
              type="button"
              aria-label={t("resetLabel", { name: m.name })}
              title={t("resetTitle")}
              onClick={onReset}
              className="flex size-9 cursor-pointer items-center justify-center rounded-[9px] border-none bg-transparent text-brand hover:bg-surface-2"
            >
              <Icon name="key" size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label={t("removeLabel", { name: m.name })}
              title={t("removeTitle")}
              onClick={() => onAskRemove(true)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-[9px] border-none bg-transparent text-danger hover:bg-danger-tint"
            >
              <Icon name="userMinus" size={18} strokeWidth={2} />
            </button>
          </span>
        )}
      </span>
      {confirming && (
        <div role="alert" className="col-span-full mb-3 flex w-full flex-wrap items-center justify-between gap-3 rounded-[10px] bg-danger-tint px-3.5 py-2.5 text-sm font-semibold text-danger">
          <span>{t("removeConfirm", { name: m.name })}</span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => onAskRemove(false)}
              className="h-8.5 cursor-pointer rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink"
            >
              {t("no")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => removeMemberAction(projectId, m.userId), t("removed", { name: m.name }))}
              className="h-8.5 cursor-pointer rounded-lg border-none bg-danger-strong px-3 text-sm font-semibold text-white"
            >
              {t("yesRemove")}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
