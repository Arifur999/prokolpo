"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { checkInviteAction } from "@/app/(auth)/register/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { Icon } from "@/components/shared/icon/Icon";
import { formatDate } from "@/lib/dhakaTime";
import { normalizePhone } from "@/lib/phone";
import { ROUTES } from "@/lib/routes";
import type { IInviteCheck } from "@/types/auth.types";
import { AuthHeading } from "../AuthHeading";
import { SubmitButton } from "../SubmitButton";
import { RegisterForm } from "./RegisterForm";

// Registration is closed or invite-only (board RegisterClosed). A number a project's owner
// invited can still open an account: check it, then register with it fixed.
export function RegistrationClosedNotice() {
  const t = useTranslations("Auth.register");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string>();
  const [found, setFound] = useState<IInviteCheck | null>(null);
  const [registering, setRegistering] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (found && registering) {
    return (
      <>
        <AuthHeading title={t("title")} subtitle={t("invitedSubtitle")} />
        <RegisterForm invite={found} />
      </>
    );
  }

  const check = () => {
    if (found) return setRegistering(true);
    const normalized = normalizePhone(phone);
    if (!phone.trim()) return setError(t("inviteEmpty"));
    if (!normalized) return setError(t("inviteBad"));
    startTransition(async () => {
      const result = await checkInviteAction(normalized);
      if (result.success) setFound(result.data);
      else setError(result.fieldErrors?.phone ?? result.message);
    });
  };

  return (
    <>
      <AuthHeading title={t("closedTitle")} subtitle={t("closedSubtitle")} />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          check();
        }}
        className="flex flex-col gap-4.5"
      >
        <div role="status" className="flex gap-3 rounded-xl border border-gold-border bg-gold-tint px-4 py-3.5 text-gold-deep">
          <Icon name="info" size={22} strokeWidth={2} className="mt-px" />
          <div className="flex flex-col gap-1">
            <strong className="text-[15px] text-gold-darkest">{t("closedNoticeTitle")}</strong>
            <span className="text-sm leading-[1.6]">{t("closedNoticeBody")}</span>
          </div>
        </div>
        <LabeledInput
          id="rg-inv"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          label={t("invitePhone")}
          placeholder={t("phonePlaceholder")}
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setError(undefined);
            setFound(null);
          }}
          error={error}
        />
        {found && (
          <div className="flex items-center gap-3 rounded-xl border border-success-line bg-brand-wash px-3.5 py-3">
            <span aria-hidden="true" className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand">
              <Icon name="building" size={20} strokeWidth={2} />
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">{t("inviteFound", { project: found.project, role: t(`role.${found.role}`) })}</span>
              <span className="text-[13px] text-ink-2">{t("inviteFoundSub", { by: found.invitedBy, date: formatDate(new Date(found.createdAt)) })}</span>
            </span>
          </div>
        )}
        <SubmitButton isSubmitting={isPending} label={found ? t("inviteGo") : t("inviteCheck")} submittingLabel={t("inviteChecking")} />
        <p className="m-0 text-sm leading-[1.6] text-ink-2">
          {t("closedHelp")}{" "}
          <Link href={ROUTES.support} className="font-semibold">
            {t("closedHelpLink")}
          </Link>
          {t("closedHelpEnd")}
        </p>
      </form>
    </>
  );
}
