"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteAction, lookupAction } from "@/app/(dashboardLayout)/projects/[projectId]/members/_action";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { nameInitials } from "@/lib/memberLook";
import { displayPhone, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { ILookup, TeamRole } from "@/types/members.types";

type Status = "empty" | "invalid" | "checking" | "member" | "pending" | "found" | "new";

const STATUS_LOOK: Record<Status, string> = {
  empty: "bg-surface-2 text-ink-2",
  checking: "bg-surface-2 text-ink-2",
  invalid: "bg-danger-tint text-danger",
  member: "bg-danger-tint text-danger",
  pending: "bg-gold-tint text-gold-ink",
  found: "bg-brand-tint text-success",
  new: "bg-gold-tint text-gold-ink",
};

const ROLES: TeamRole[] = ["MANAGER", "VIEWER"];

// "মেম্বার যোগ করুন" (board MembersInvite): a number, checked as it is typed, and a role.
// A number with an account joins at once; any other waits as an invitation.
export function InviteDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const t = useTranslations("Members.invite");
  const tm = useTranslations("Members");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<TeamRole>("VIEWER");
  const [lookup, setLookup] = useState<{ phone: string; result: ILookup } | null>(null);
  const [isPending, startTransition] = useTransition();

  const normalized = normalizePhone(phone);
  useEffect(() => {
    if (!normalized) return;
    const timer = setTimeout(() => {
      void lookupAction(projectId, normalized).then((result) => {
        if (result.success) setLookup({ phone: normalized, result: result.data });
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [projectId, normalized]);

  const known = normalized && lookup?.phone === normalized ? lookup.result : null;
  const status: Status = !phone.trim() ? "empty" : !normalized ? "invalid" : !known ? "checking" : (known.status.toLowerCase() as Status);
  const name = known?.name ?? "";
  const blocked = status !== "found" && status !== "new";

  const titles: Record<Status, string> = {
    empty: t("statusEmptyTitle"),
    checking: t("checking"),
    invalid: t("statusInvalidTitle"),
    member: t("statusMemberTitle"),
    pending: t("statusPendingTitle"),
    found: t("statusFoundTitle", { name }),
    new: t("statusNewTitle"),
  };
  const texts: Record<Status, string> = {
    empty: t("statusEmpty"),
    checking: "",
    invalid: t("statusInvalid"),
    member: t("statusMember", { name }),
    pending: t("statusPending"),
    found: t("statusFound"),
    new: t("statusNew"),
  };

  const save = () => {
    if (blocked || !normalized) return;
    startTransition(async () => {
      const result = await inviteAction(projectId, normalized, role);
      if (!result.success) return void toast.error(result.fieldErrors?.phone ?? result.message);
      const added = result.data;
      toast.success(
        added.status === "MEMBER" ? t("added", { name: added.name ?? "", role: tm(`role.${role}`) }) : t("kept", { phone: displayPhone(added.phone) }),
      );
      onClose();
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle")}
      closeLabel={t("close")}
      onClose={onClose}
      size="sm"
      topClass="top-20"
      footer={
        <DialogButtons
          cancel={t("cancel")}
          submit={status === "new" ? t("keep") : t("add")}
          onCancel={onClose}
          onSubmit={save}
          pending={isPending}
          disabled={blocked}
        />
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="iv-phone" className="text-[15px] font-semibold">
          {t("phone")} <span className="text-danger">*</span>
        </label>
        <input
          id="iv-phone"
          type="tel"
          autoFocus
          autoComplete="off"
          placeholder="01XXXXXXXXX"
          aria-describedby="iv-status"
          aria-invalid={status === "invalid" || status === "member"}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={cn(
            "h-12 w-full rounded-[10px] bg-white px-3.5 text-[17px] font-semibold text-ink outline-none",
            status === "invalid" || status === "member" ? "border-[1.5px] border-danger-strong" : "border border-line",
          )}
        />
        <div id="iv-status" aria-live="polite" className={cn("flex items-center gap-3 rounded-xl px-3.5 py-3", STATUS_LOOK[status])}>
          {status === "found" && (
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">
              {nameInitials(name)}
            </span>
          )}
          <span className="flex flex-col">
            <span className="text-sm font-bold">{titles[status]}</span>
            {texts[status] && <span className="text-[13px] leading-normal">{texts[status]}</span>}
          </span>
        </div>
      </div>
      <div role="radiogroup" aria-labelledby="iv-role-title" className="flex flex-col gap-2">
        <span id="iv-role-title" className="text-[15px] font-semibold">
          {t("role")}
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ROLES.map((value) => {
            const on = value === role;
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[14px]",
                  on ? "border-2 border-brand bg-brand-wash p-3.25" : "border border-line bg-white p-3.5",
                )}
              >
                <input type="radio" name="iv-role" checked={on} onChange={() => setRole(value)} className="m-0 mt-0.75 size-4.5 shrink-0 accent-brand" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{tm(`role.${value}`)}</span>
                  <span className="text-[13px] leading-normal text-ink-2">{t(value === "MANAGER" ? "managerNote" : "viewerNote")}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </FormDialog>
  );
}
