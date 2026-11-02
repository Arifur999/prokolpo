"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { issueResetCodeAction } from "@/app/(admin)/admin/(panel)/users/[userId]/_action";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { formatTime } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";

type Check = { label: string; answer: string };

// "রিসেট কোড দিন" (board AdminUserReset): staff call the registered number and tick off four
// answers, then read out a 30-minute code.
export function ResetCodeDialog({ u, checks, onClose }: { u: IAdminUserDetail; checks: Check[]; onClose: () => void }) {
  const t = useTranslations("AdminUser");
  const router = useRouter();
  const [ticked, setTicked] = useState(checks.map(() => false));
  const [note, setNote] = useState("");
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const name = `${u.firstName} ${u.lastName}`;
  const left = ticked.filter((x) => !x).length;
  const spaced = code ? `${code.code.slice(0, 3)} ${code.code.slice(3)}` : "";

  const make = () =>
    startTransition(async () => {
      const result = await issueResetCodeAction(u.id, note);
      if (!result.success) return void toast.error(result.message);
      setCode(result.data);
      router.refresh();
    });

  return (
    <FormDialog
      title={t("reset.title", { name })}
      subtitle={code ? t("reset.step2") : t("reset.step1")}
      closeLabel={t("close")}
      onClose={onClose}
      size="sm"
      topClass="top-18"
      bodyClass="flex flex-col gap-3.5 px-6 py-4.5"
      footer={
        code ? (
          <>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(code.code);
                toast.success(t("reset.copied", { code: spaced }));
              }}
              className="h-11 cursor-pointer rounded-xl border border-line bg-white px-4 text-[15px] font-semibold text-ink"
            >
              {t("reset.copy")}
            </button>
            <button type="button" onClick={onClose} className="h-11 cursor-pointer rounded-xl border-none bg-brand px-4.5 text-[15px] font-semibold text-white">
              {t("reset.finish")}
            </button>
          </>
        ) : (
          <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
            <span className={cn("text-[13px] font-semibold", left ? "text-gold-ink" : "text-success")}>
              {left ? t("reset.left", { count: left }) : t("reset.allDone")}
            </span>
            <DialogButtons cancel={t("cancel")} submit={t("reset.make")} onCancel={onClose} onSubmit={make} pending={isPending} disabled={left > 0} />
          </div>
        )
      }
    >
      {code ? (
        <>
          <div className="flex flex-col items-center gap-1 rounded-[14px] border border-success-line bg-brand-wash px-4 py-4.5">
            <span className="text-sm font-semibold text-ink-2">{t("reset.tell", { name })}</span>
            <strong aria-live="polite" className="text-[40px] leading-tight font-bold tracking-[0.14em] text-brand">
              {spaced}
            </strong>
            <span className="text-center text-[13px] text-ink-2">{t("reset.until", { time: formatTime(new Date(code.expiresAt)) })}</span>
          </div>
          <ol className="m-0 flex flex-col gap-1.5 pl-5.5 text-sm leading-[1.6]">
            <li>{t("reset.how1")}</li>
            <li>{t("reset.how2")}</li>
            <li>{t("reset.how3")}</li>
          </ol>
          <p className="m-0 text-[13px] text-ink-3">{t("reset.logged")}</p>
        </>
      ) : (
        <>
          <p className="m-0 flex items-start gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3 text-sm leading-[1.6]">
            <Icon name="phone" size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-brand" />
            <span>{t("reset.callHint", { phone: displayPhone(u.phone) })}</span>
          </p>
          <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
            <legend className="mb-2 text-[15px] font-semibold">{t("reset.checks")}</legend>
            {checks.map((c, i) => (
              <label
                key={c.label}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-[10px] px-3 py-2.5",
                  ticked[i] ? "border-[1.5px] border-brand bg-brand-wash" : "border border-line-2 bg-white",
                )}
              >
                <input
                  type="checkbox"
                  checked={ticked[i]}
                  onChange={() => setTicked(ticked.map((x, j) => (j === i ? !x : x)))}
                  className="m-0 mt-px size-5 shrink-0 accent-brand"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{c.label}</span>
                  <span className="text-[13px] text-ink-2">{t("reset.answer", { answer: c.answer })}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="rs-note" className="text-sm font-semibold">
              {t("reset.note")} <span className="font-normal text-ink-3">{t("reset.noteHint")}</span>
            </label>
            <input
              id="rs-note"
              type="text"
              maxLength={200}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("reset.notePlaceholder")}
              className="box-border h-11 w-full rounded-[10px] border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand focus:shadow-focus"
            />
          </div>
        </>
      )}
    </FormDialog>
  );
}
