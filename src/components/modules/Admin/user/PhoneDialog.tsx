"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePhoneAction } from "@/app/(admin)/admin/(panel)/users/[userId]/_action";
import { TextArea } from "@/components/shared/form/TextArea";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";
import { AppCodeField, codeDigits } from "./AppCodeField";

const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g, "");

// "মোবাইল নম্বর বদলান" (board AdminUserDetail): for a lost SIM, with a reason and the staff
// member's own app code; the account is signed out everywhere.
export function PhoneDialog({ u, onClose }: { u: IAdminUserDetail; onClose: () => void }) {
  const t = useTranslations("AdminUser");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [verified, setVerified] = useState(false);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const digits = toLatin(phone);
  const errs = {
    phone: submitted && !/^01[3-9]\d{8}$/.test(digits) ? t("phone.errPhone") : serverErr.phone,
    verified: submitted && !verified,
    reason: submitted && reason.trim().length < 10 ? t("errReason") : serverErr.reason,
    code: submitted && codeDigits(code).length !== 6 ? t("errCode") : serverErr.code,
  };

  const save = () => {
    setSubmitted(true);
    setServerErr({});
    if (!/^01[3-9]\d{8}$/.test(digits) || !verified || reason.trim().length < 10 || codeDigits(code).length !== 6) return;
    startTransition(async () => {
      const result = await changePhoneAction(u.id, { phone: digits, reason, code: codeDigits(code) });
      if (!result.success) {
        if (result.fieldErrors) return setServerErr(result.fieldErrors);
        return setServerErr({ code: result.message });
      }
      toast.success(t("phone.done", { phone: displayPhone(digits) }));
      onClose();
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("phone.title")}
      subtitle={t("phone.sub", { name: `${u.firstName} ${u.lastName}`, phone: displayPhone(u.phone) })}
      closeLabel={t("close")}
      onClose={onClose}
      size="sm"
      bodyClass="flex flex-col gap-3.5 px-6 py-4.5"
      footer={<DialogButtons cancel={t("cancel")} submit={t("phone.submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ph-new" className="text-[15px] font-semibold">
          {t("phone.new")}
        </label>
        <input
          id="ph-new"
          type="tel"
          inputMode="tel"
          placeholder="01XXX-XXXXXX"
          value={phone}
          aria-invalid={!!errs.phone}
          onChange={(event) => setPhone(event.target.value)}
          className={cn(
            "box-border h-11.5 w-full rounded-[10px] bg-white px-3.5 text-base text-ink outline-none focus:shadow-focus",
            errs.phone ? "border-[1.5px] border-danger-strong" : "border border-line focus:border-brand",
          )}
        />
        {errs.phone && <span className="text-[13px] text-danger">{errs.phone}</span>}
      </div>
      <label className="flex cursor-pointer items-start gap-2.5">
        <input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} className="m-0 mt-px size-5 shrink-0 accent-brand" />
        <span className="flex flex-col">
          <span className="text-sm font-semibold">{t("phone.verified")}</span>
          <span className={cn("text-[13px] leading-normal", errs.verified ? "text-danger" : "text-ink-2")}>{t("phone.verifiedHint")}</span>
        </span>
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ph-why" className="text-[15px] font-semibold">
          {t("phone.reason")}
        </label>
        <TextArea
          id="ph-why"
          rows={2}
          maxLength={300}
          placeholder={t("phone.reasonPlaceholder")}
          value={reason}
          invalid={!!errs.reason}
          onChange={(event) => setReason(event.target.value)}
          className="text-sm"
        />
        {errs.reason && <span className="text-[13px] text-danger">{errs.reason}</span>}
      </div>
      <AppCodeField id="ph-2fa" value={code} onChange={setCode} error={errs.code} />
      <ul className="m-0 rounded-xl bg-gold-tint py-3 pr-3.5 pl-8 text-[13px] leading-[1.7] text-gold-deep">
        <li>{t("phone.effect1")}</li>
        <li>{t("phone.effect2")}</li>
        <li>{u.email ? t("phone.effect3Mail", { email: u.email }) : t("phone.effect3App")}</li>
      </ul>
    </FormDialog>
  );
}
