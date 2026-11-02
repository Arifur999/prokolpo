"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/shared/icon/Icon";
import { displayPhone } from "@/lib/phone";

type BackupStepProps = { codes: string[]; phone: string; next: string };

// "ব্যাকআপ কোড রেখে দিন" (board AdminTwoFactorBackup): the ten one-time codes, shown once, to
// download, print or copy before going on.
export function BackupStep({ codes, phone, next }: BackupStepProps) {
  const t = useTranslations("AdminSecurity.setup");
  const [kept, setKept] = useState(false);
  const [nudge, setNudge] = useState(false);
  const text = [t("fileHead", { phone: displayPhone(phone) }), "", ...codes.map((c, i) => `${i + 1}. ${c}`)].join("\n");

  const tools = [
    {
      label: t("download"),
      icon: "download" as const,
      run: () => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
        link.download = "prokolpo-backup-codes.txt";
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success(t("downloaded"));
      },
    },
    { label: t("print"), icon: "printer" as const, run: () => window.print() },
    {
      label: t("copyAll"),
      icon: "copy" as const,
      run: () => {
        void navigator.clipboard?.writeText(text);
        toast.success(t("copiedAll"));
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4.5">
      <span role="status" className="flex items-center gap-2 self-start rounded-full bg-brand-tint px-3 py-1 text-sm font-bold text-success">
        <Icon name="check" size={16} strokeWidth={2.4} />
        {t("on")}
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 id="tf-title" className="m-0 text-[26px] leading-[1.35] font-semibold">
          {t("backupTitle")}
        </h1>
        <p className="m-0 text-[15px] leading-[1.6] text-ink-2">{t("backupSub")}</p>
      </div>
      <ol className="m-0 grid list-none grid-cols-1 gap-x-8 gap-y-2.5 rounded-[14px] border border-dashed border-line-strong bg-surface-2 px-5 py-4 font-mono text-[19px] font-bold tracking-[0.08em] sm:grid-cols-2">
        {codes.map((code, i) => (
          <li key={code} className="flex gap-3.5">
            <span className="w-5.5 text-right font-sans text-[13px] leading-7 font-semibold tracking-normal text-ink-5">{i + 1}</span>
            {code}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2.5 print:hidden">
        {tools.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.run}
            className="flex h-10.5 cursor-pointer items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-ink"
          >
            <Icon name={b.icon} size={16} strokeWidth={2} />
            {b.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-3 pt-4.5 print:hidden">
        <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
          <input
            type="checkbox"
            checked={kept}
            onChange={(event) => {
              setKept(event.target.checked);
              setNudge(false);
            }}
            className="m-0 size-5 accent-brand"
          />
          {t("kept")}
        </label>
        {kept ? (
          <Link href={next} className="flex h-12 items-center rounded-xl bg-brand px-5.5 text-base font-semibold text-white no-underline hover:text-white">
            {t("open")}
          </Link>
        ) : (
          <button
            type="button"
            aria-disabled="true"
            onClick={() => setNudge(true)}
            className="h-12 cursor-not-allowed rounded-xl border-none bg-rule px-5.5 text-base font-semibold text-ink-4"
          >
            {t("open")}
          </button>
        )}
      </div>
      {nudge && <span className="-mt-2 text-[13px] text-danger">{t("nudge")}</span>}
    </div>
  );
}
