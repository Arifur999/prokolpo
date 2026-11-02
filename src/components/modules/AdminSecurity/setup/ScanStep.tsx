"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { enableTwoFactorAction } from "@/app/(admin)/admin/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IStaffStatus } from "@/types/staff.types";

type ScanStepProps = { status: IStaffStatus; qrSvg: string; setupKey: string; onEnabled: (codes: string[]) => void };

const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g, "");

// "দুই ধাপের যাচাই চালু করুন" (board AdminTwoFactorSetup): scan the QR code (or type the key),
// then prove it with the app's first code.
export function ScanStep({ status, qrSvg, setupKey, onEnabled }: ScanStepProps) {
  const t = useTranslations("AdminSecurity");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const enable = () => {
    const digits = toLatin(code);
    if (digits.length !== 6) return setError(t("verify.errApp"));
    startTransition(async () => {
      const result = await enableTwoFactorAction(digits);
      if (result.success) return onEnabled(result.data.codes);
      setError(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-5.5">
      <div className="flex flex-col gap-1.5">
        <h1 id="tf-title" className="m-0 text-[26px] leading-[1.35] font-semibold">
          {t("setup.title")}
        </h1>
        <p className="m-0 text-[15px] leading-[1.6] text-ink-2">{t("setup.sub", { role: t(`roles.${status.staffRole}`) })}</p>
      </div>
      <div className="flex flex-col items-center gap-7 sm:flex-row">
        <span
          role="img"
          aria-label={t("setup.qr")}
          className="flex size-50 shrink-0 rounded-2xl border border-line-2 bg-white p-3.5 [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <div className="flex grow flex-col gap-3">
          <ol className="m-0 flex flex-col gap-1.5 pl-5.5 text-[15px] leading-[1.55]">
            <li>{t("setup.s1")}</li>
            <li>{t("setup.s2")}</li>
            <li>{t("setup.s3", { phone: displayPhone(status.phone) })}</li>
          </ol>
          <div className="flex flex-col gap-1.5 rounded-xl bg-surface-2 px-3.5 py-3">
            <span className="text-[13px] text-ink-2">{t("setup.keyHint")}</span>
            <span className="flex flex-wrap items-center gap-2.5">
              <code className="font-mono text-[17px] font-bold tracking-[0.08em] text-ink">{setupKey}</code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(setupKey.replace(/\s/g, ""));
                  setCopied(true);
                }}
                className="h-8 cursor-pointer rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-ink"
              >
                {copied ? t("setup.copied") : t("setup.copy")}
              </button>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-line-3 pt-5">
        <label htmlFor="tf-code" className="text-[15px] font-semibold">
          {t("setup.codeLabel")}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="tf-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••• •••"
            value={code}
            aria-invalid={!!error}
            aria-describedby="tf-help"
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => event.key === "Enter" && enable()}
            className={cn(
              "box-border h-13 w-55 rounded-xl bg-white px-4 text-2xl font-bold tracking-[0.25em] text-ink outline-none focus:shadow-focus",
              error ? "border-[1.5px] border-danger-strong" : "border border-line focus:border-brand",
            )}
          />
          <button
            type="button"
            onClick={enable}
            disabled={isPending}
            aria-busy={isPending}
            className="flex h-13 cursor-pointer items-center gap-2 rounded-xl border-none bg-brand px-5.5 text-base font-semibold text-white"
          >
            {isPending && <Icon name="spinner" size={18} strokeWidth={2.4} className="animate-spin" />}
            {t("setup.enable")}
          </button>
        </div>
        <span id="tf-help" role={error ? "alert" : undefined} className={cn("text-[13px]", error ? "text-danger" : "text-ink-3")}>
          {error || t("setup.codeHelp")}
        </span>
      </div>
    </div>
  );
}
