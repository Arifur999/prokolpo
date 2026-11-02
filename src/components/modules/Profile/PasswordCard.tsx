"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/app/(dashboardLayout)/(home)/profile/_action";
import { FieldMessage } from "@/components/shared/form/FieldMessage";
import { FormField } from "@/components/shared/form/FormField";
import { PasswordMeter } from "@/components/shared/form/PasswordMeter";
import { TextInput } from "@/components/shared/form/TextInput";
import { formatDate } from "@/lib/dhakaTime";
import { passwordRulesMet } from "@/lib/passwordStrength";
import { cn } from "@/lib/utils";
import { ProfileCard } from "./ProfileCard";

const EMPTY = { current: "", next: "", again: "" };

// "পাসওয়ার্ড বদলান" (board Profile): the current password, a new one twice, and whether the
// other devices are signed out with it.
export function PasswordCard({ changedAt }: { changedAt: string | null }) {
  const t = useTranslations("Profile.password");
  const router = useRouter();
  const [pw, setPw] = useState(EMPTY);
  const [shown, setShown] = useState(false);
  const [logoutOthers, setLogoutOthers] = useState(true);
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const rules = passwordRulesMet(pw.next);
  const matches = pw.again !== "" && pw.again === pw.next;
  const currentError = errors.currentPassword ?? (!tried ? undefined : !pw.current ? t("currentMissing") : pw.current === pw.next ? t("same") : undefined);
  const set = (patch: Partial<typeof EMPTY>) => {
    setPw((v) => ({ ...v, ...patch }));
    setErrors({});
  };

  const save = () =>
    startTransition(async () => {
      setTried(true);
      if (!pw.current || pw.current === pw.next || !rules.length || !rules.mix || !matches) return;
      const result = await changePasswordAction(pw.current, pw.next, logoutOthers);
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        if (!result.fieldErrors) toast.error(result.message);
        return;
      }
      setPw(EMPTY);
      setTried(false);
      toast.success(logoutOthers ? t("doneOthers") : t("done"));
      router.refresh();
    });

  const type = shown ? "text" : "password";
  return (
    <ProfileCard
      id="pf-pw"
      title={t("title")}
      sub={changedAt ? t("lastChanged", { date: formatDate(new Date(changedAt)) }) : t("neverChanged")}
      aside={
        <button
          type="button"
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
          className="h-9 cursor-pointer rounded-[9px] border border-line bg-white px-3 text-[13px] font-semibold text-ink"
        >
          {shown ? t("hide") : t("show")}
        </button>
      }
      footer={
        <>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={logoutOthers} onChange={(e) => setLogoutOthers(e.target.checked)} className="m-0 size-4.5 accent-brand" />
            {t("logoutOthers")}
          </label>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-[10px] border-none bg-brand px-4.5 text-[15px] font-semibold text-white disabled:cursor-wait disabled:opacity-70"
          >
            {t("submit")}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 px-5.5 py-4.5 sm:grid-cols-2">
        <FormField id="pw-cur" label={t("current")} className="sm:col-span-2 sm:max-w-[calc(50%-8px)]">
          <TextInput
            id="pw-cur"
            type={type}
            autoComplete="current-password"
            value={pw.current}
            onChange={(e) => set({ current: e.target.value })}
            invalid={Boolean(currentError)}
            aria-describedby={currentError ? "pw-cur-msg" : undefined}
          />
          {currentError && (
            <FieldMessage id="pw-cur-msg" tone="error">
              {currentError}
            </FieldMessage>
          )}
        </FormField>
        <FormField id="pw-new" label={t("next")}>
          <TextInput
            id="pw-new"
            type={type}
            autoComplete="new-password"
            value={pw.next}
            onChange={(e) => set({ next: e.target.value })}
            invalid={Boolean(errors.password)}
            aria-describedby="pw-rules"
          />
          <PasswordMeter id="pw-rules" password={pw.next} attempted={tried} />
          {errors.password && (
            <FieldMessage id="pw-new-msg" tone="error">
              {errors.password}
            </FieldMessage>
          )}
        </FormField>
        <FormField id="pw-again" label={t("again")}>
          <TextInput
            id="pw-again"
            type={type}
            autoComplete="new-password"
            value={pw.again}
            onChange={(e) => set({ again: e.target.value })}
            invalid={pw.again !== "" && !matches}
          />
          {pw.again && (
            <span className={cn("text-[13px] font-semibold", matches ? "text-success" : "text-danger")}>{matches ? t("matches") : t("mismatch")}</span>
          )}
        </FormField>
      </div>
    </ProfileCard>
  );
}
