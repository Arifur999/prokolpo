"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { verifyCodeAction } from "@/app/(admin)/admin/_action";
import { logoutAction } from "@/app/_actions/authActions";
import { Icon } from "@/components/shared/icon/Icon";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IStaffStatus } from "@/types/staff.types";

const BACKUP_SHAPE = /^[A-Z2-9]{4}-?[A-Z2-9]{4}$/;
const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

type VerifyCardProps = { status: IStaffStatus; initials: string; idle: boolean; next: string };

// "যাচাই কোড দিন" (board AdminTwoFactor): an app code or a backup code opens the panel; five
// wrong in a row lock it for 15 minutes.
export function VerifyCard({ status, initials, idle, next }: VerifyCardProps) {
  const t = useTranslations("AdminSecurity");
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(!!status.lockedUntil);
  const [done, setDone] = useState<{ usedBackup: boolean; backupLeft: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const shown = locked ? t("verify.locked") : error;

  const verify = () => {
    if (locked) return;
    const typed = backup ? code.trim().toUpperCase() : toLatin(code).replace(/\D/g, "");
    if (backup ? !BACKUP_SHAPE.test(typed) : typed.length !== 6) return setError(t(backup ? "verify.errBackup" : "verify.errApp"));
    startTransition(async () => {
      const result = await verifyCodeAction(typed, backup);
      if (result.success) return setDone(result.data);
      setError(result.message);
      if (result.code === "TWO_FACTOR_LOCKED") setLocked(true);
    });
  };

  const switchMode = () => {
    setBackup(!backup);
    setCode("");
    if (!locked) setError("");
  };

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center gap-3.5 text-center">
        <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-brand-tint text-success">
          <Icon name="check" size={30} strokeWidth={2.4} />
        </span>
        <h1 className="m-0 text-[26px] leading-[1.35] font-semibold">{t("verify.doneTitle")}</h1>
        <p className="m-0 text-[15px] leading-[1.6] text-ink-2">{t("verify.doneText")}</p>
        {done.usedBackup && (
          <span className="rounded-xl bg-gold-tint px-3 py-2.5 text-sm leading-[1.55] text-gold-deep">
            {t("verify.doneBackup", { count: done.backupLeft })}
          </span>
        )}
        <Link
          href={next}
          className="flex h-13 items-center justify-center self-stretch rounded-xl bg-brand text-base font-semibold text-white no-underline hover:text-white"
        >
          {t("verify.open")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-ink text-gold-light">
          <Icon name="shieldCheck" size={28} strokeWidth={2} />
        </span>
        <h1 id="vf-title" className="m-0 text-[26px] leading-[1.35] font-semibold">
          {t(backup ? "verify.titleBackup" : "verify.titleApp")}
        </h1>
        <p className="m-0 text-[15px] leading-[1.6] text-ink-2">{t(backup ? "verify.subBackup" : idle ? "verify.subIdle" : "verify.subApp")}</p>
      </div>
      <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5">
        <span aria-hidden="true" className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-gold-light">
          {initials}
        </span>
        <span className="flex grow flex-col">
          <span className="text-sm font-semibold">{status.name}</span>
          <span className="text-[13px] text-ink-3">
            {displayPhone(status.phone)} · {t(`roles.${status.staffRole}`)}
          </span>
        </span>
        <form action={logoutAction}>
          <button type="submit" className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-brand underline">
            {t("verify.notYou")}
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="vf-code" className="text-[15px] font-semibold">
          {t(backup ? "verify.labelBackup" : "verify.labelApp")}
        </label>
        <input
          id="vf-code"
          inputMode={backup ? "text" : "numeric"}
          autoComplete="one-time-code"
          autoFocus
          placeholder={backup ? "XXXX-XXXX" : "••• •••"}
          value={code}
          disabled={locked}
          aria-invalid={!!shown}
          aria-describedby="vf-help"
          onChange={(event) => {
            setCode(event.target.value);
            if (!locked) setError("");
          }}
          onKeyDown={(event) => event.key === "Enter" && verify()}
          className={cn(
            "box-border h-15 w-full rounded-xl px-4 text-center text-[28px] font-bold text-ink outline-none focus:shadow-focus",
            backup ? "tracking-[0.12em] uppercase" : "tracking-[0.35em]",
            shown ? "border-[1.5px] border-danger-strong" : "border border-line focus:border-brand",
            locked ? "bg-surface-4" : "bg-white",
          )}
        />
        {shown ? (
          <span id="vf-help" role="alert" className="text-sm leading-normal text-danger">
            {shown}
          </span>
        ) : (
          <span id="vf-help" className="text-[13px] text-ink-3">
            {backup ? t("verify.helpBackup", { count: status.backupLeft }) : t("verify.helpApp")}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={verify}
        disabled={locked || isPending}
        aria-busy={isPending}
        className={cn(
          "flex h-13 items-center justify-center gap-2 rounded-xl border-none text-base font-semibold",
          locked ? "cursor-not-allowed bg-rule text-ink-4" : "cursor-pointer bg-brand text-white",
        )}
      >
        {isPending && <Icon name="spinner" size={18} strokeWidth={2.4} className="animate-spin" />}
        {t("verify.submit")}
      </button>
      <button
        type="button"
        onClick={switchMode}
        className="h-9 cursor-pointer self-center rounded-lg border-none bg-transparent px-2.5 text-[15px] font-semibold text-brand underline"
      >
        {t(backup ? "verify.toApp" : "verify.toBackup")}
      </button>
    </div>
  );
}
