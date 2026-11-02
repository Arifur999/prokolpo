"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setSuspendedAction } from "@/app/(admin)/admin/(panel)/users/[userId]/_action";
import { TextArea } from "@/components/shared/form/TextArea";
import { FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { formatDate, formatTime } from "@/lib/dhakaTime";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";
import { AppCodeField, codeDigits } from "./AppCodeField";

// Suspending or reopening an account (boards AdminUserDetail, AdminUserSuspended): what it
// does, a reason for the log and the staff member's own app code.
export function SuspendDialog({ u, suspend, onClose }: { u: IAdminUserDetail; suspend: boolean; onClose: () => void }) {
  const t = useTranslations("AdminUser");
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [isPending, startTransition] = useTransition();
  const name = `${u.firstName} ${u.lastName}`;
  const reasonErr = submitted && reason.trim().length < 10 ? t("errReason") : "";
  const codeErr = submitted && codeDigits(code).length !== 6 ? t("errCode") : serverErr;
  const effects = suspend ? ["s1", "s2", "s3", "s4"] : ["u1", "u2", "u3"];
  const was =
    !suspend && u.suspendedAt
      ? t("suspendedLine", {
          at: `${formatDate(new Date(u.suspendedAt))} ${formatTime(new Date(u.suspendedAt))}`,
          by: u.suspendedBy ?? "",
          reason: u.suspendedReason ?? "",
        })
      : t("sp.suspendSub");

  const save = () => {
    setSubmitted(true);
    setServerErr("");
    if (reason.trim().length < 10 || codeDigits(code).length !== 6) return;
    startTransition(async () => {
      const result = await setSuspendedAction(u.id, suspend, { reason, code: codeDigits(code) });
      if (!result.success) return setServerErr(result.fieldErrors?.reason ?? result.message);
      toast.success(t(suspend ? "sp.suspended" : "sp.unsuspended", { name }));
      onClose();
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t(suspend ? "sp.suspendTitle" : "sp.unsuspendTitle", { name })}
      subtitle={was}
      closeLabel={t("close")}
      onClose={onClose}
      size="sm"
      topClass="top-18"
      bodyClass="flex flex-col gap-3.5 px-6 py-4.5"
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 cursor-pointer rounded-xl border border-line bg-white px-4 text-[15px] font-semibold text-ink"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className={cn(
              "flex h-11 cursor-pointer items-center gap-2 rounded-xl border-none px-4.5 text-[15px] font-semibold text-white",
              suspend ? "bg-danger-strong" : "bg-success",
            )}
          >
            {isPending && <Icon name="spinner" size={18} strokeWidth={2.4} className="animate-spin" />}
            {t(suspend ? "sp.suspendButton" : "sp.unsuspendButton")}
          </button>
        </div>
      }
    >
      <ul className={cn("m-0 rounded-xl py-3 pr-3.5 pl-8 text-sm leading-[1.7]", suspend ? "bg-danger-tint text-danger-ink-2" : "bg-brand-wash text-ink")}>
        {effects.map((k) => (
          <li key={k}>{t(`sp.${k as "s1"}`)}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sp-why" className="text-[15px] font-semibold">
          {t("sp.reason")} <span className="font-normal text-ink-3">{t("sp.reasonHint")}</span>
        </label>
        <TextArea
          id="sp-why"
          rows={3}
          maxLength={300}
          placeholder={t(suspend ? "sp.suspendPlaceholder" : "sp.unsuspendPlaceholder")}
          value={reason}
          invalid={!!reasonErr}
          onChange={(event) => setReason(event.target.value)}
          className="text-sm"
        />
        {reasonErr && <span className="text-[13px] text-danger">{reasonErr}</span>}
      </div>
      <AppCodeField id="sp-2fa" value={code} onChange={setCode} error={codeErr} />
    </FormDialog>
  );
}
