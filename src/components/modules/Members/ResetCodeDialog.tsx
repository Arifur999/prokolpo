"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { resetCodeAction } from "@/app/(dashboardLayout)/projects/[projectId]/members/_action";
import { FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { formatTime } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import type { IMember, IResetCode } from "@/types/members.types";

// "482913" -> "482 913", as the owner reads it out.
const spaced = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

// "পাসওয়ার্ড রিসেট কোড" (board MembersResetCode): opening it makes a fresh 6-digit code
// for the member; the owner reads it out, copies it or sends it on WhatsApp.
export function ResetCodeDialog({ projectId, member, onClose }: { projectId: string; member: IMember; onClose: () => void }) {
  const t = useTranslations("Members.reset");
  const tm = useTranslations("Members");
  const [code, setCode] = useState<IResetCode | null>(null);
  const [isPending, startTransition] = useTransition();

  const issue = useCallback(
    (announce: boolean) =>
      startTransition(async () => {
        const result = await resetCodeAction(projectId, member.userId);
        if (!result.success) return void toast.error(result.message);
        setCode(result.data);
        if (announce) toast.success(t("newCodeDone"));
      }),
    [projectId, member.userId, t],
  );

  // One code per opening: a second request would void the first, and a slow first answer
  // could then leave the voided code on screen.
  const issued = useRef(false);
  useEffect(() => {
    if (issued.current) return;
    issued.current = true;
    issue(false);
  }, [issue]);

  const until = code ? formatTime(new Date(code.expiresAt)) : "";
  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      toast.success(t("copied", { code: spaced(code.code) }));
    } catch {
      toast.error(tm("failed"));
    }
  };
  const whatsapp = () => {
    if (!code) return;
    const text = encodeURIComponent(t("whatsappText", { code: spaced(code.code), time: until }));
    window.open(`https://wa.me/88${member.phone}?text=${text}`, "_blank", "noopener");
    onClose();
  };

  const secondary = "flex h-11.5 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-4 text-[15px] font-semibold text-ink";

  return (
    <FormDialog
      title={tm("resetTitle")}
      subtitle={`${member.name} · ${displayPhone(member.phone)} · ${tm(`role.${member.role}`)}`}
      closeLabel={t("close")}
      onClose={onClose}
      size="xs"
      topClass="top-20"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => issue(true)}
            className="flex h-11.5 cursor-pointer items-center gap-2 rounded-xl border-none bg-transparent px-3 text-[15px] font-semibold text-brand"
          >
            <Icon name="refresh" size={18} strokeWidth={2} />
            {t("newCode")}
          </button>
          <span className="flex gap-2.5">
            <button type="button" disabled={!code} onClick={() => void copy()} className={secondary}>
              <Icon name="copy" size={18} strokeWidth={2} />
              {t("copy")}
            </button>
            <button
              type="button"
              disabled={!code}
              onClick={whatsapp}
              className="flex h-11.5 cursor-pointer items-center gap-2 rounded-xl border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
            >
              <Icon name="whatsapp" size={18} strokeWidth={2} />
              {t("whatsapp")}
            </button>
          </span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-1 rounded-[14px] border border-success-line bg-brand-wash px-4 py-4.5">
        <span className="text-sm font-semibold text-ink-2">{t("codeFor", { name: member.name })}</span>
        <strong aria-live="polite" className="text-[40px] leading-[1.25] font-bold tracking-[0.14em] text-brand">
          {code ? spaced(code.code) : "••• •••"}
        </strong>
        <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
          <Icon name="clock" size={14} strokeWidth={2} />
          {code ? t("valid", { time: until }) : t("making")}
        </span>
      </div>
      <ol className="m-0 flex flex-col gap-1.5 pl-5.5 text-sm leading-[1.6] text-ink">
        <li>{t("step1", { name: member.name })}</li>
        <li>{t("step2")}</li>
        <li>{t("step3")}</li>
      </ol>
      <p className="m-0 flex items-start gap-2 rounded-[10px] bg-gold-tint px-3.5 py-3 text-[13px] leading-[1.6] text-gold-ink">
        <Icon name="alertTriangle" size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span>{t("warn", { name: member.name })}</span>
      </p>
    </FormDialog>
  );
}
