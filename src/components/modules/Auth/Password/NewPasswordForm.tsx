"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { resetPasswordAction } from "@/app/(auth)/reset-password/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { TextInput } from "@/components/shared/form/TextInput";
import { resetPasswordScore } from "@/lib/passwordStrength";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AuthHeading } from "../AuthHeading";
import { SubmitButton } from "../SubmitButton";
import { CenteredState, NoteBox } from "./CenteredState";

const barTone = (score: number) => (score <= 1 ? "bg-danger-strong" : score === 2 ? "bg-gold-strong" : "bg-brand-mid");

export function NewPasswordForm({ token, maskedEmail }: { token: string; maskedEmail: string | null }) {
  const t = useTranslations("Auth.reset");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string>();
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isDone) {
    return (
      <div className="flex flex-col gap-6">
        <CenteredState icon="check" tone="success" title={t("doneTitle")}>
          {t("doneBody")}
        </CenteredState>
        <Link
          href={ROUTES.login}
          className="flex h-13 items-center justify-center rounded-xl bg-brand text-base font-semibold text-white no-underline hover:text-white"
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  const score = resetPasswordScore(password);
  const rules = [
    { key: "length", met: password.length >= 8 },
    { key: "mix", met: /\p{L}/u.test(password) && /\p{N}/u.test(password) },
  ] as const;
  const matches = again !== "" && again === password;

  const submit = () =>
    startTransition(async () => {
      setAttempted(true);
      const result = await resetPasswordAction(token, { password, confirmPassword: again });
      if (result.success) setIsDone(true);
      else setError(result.fieldErrors?.password ?? result.fieldErrors?.confirmPassword ?? result.message);
    });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-6"
    >
      <AuthHeading title={t("title")} subtitle={maskedEmail ? t("fromLink", { email: maskedEmail }) : t("fromLinkNoEmail")} />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="fp-new" className="text-[15px] font-semibold">
            {t("newPassword")}
          </label>
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-brand"
          >
            {isVisible ? t("hide") : t("show")}
          </button>
        </div>
        <TextInput
          id="fp-new"
          type={isVisible ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(undefined);
          }}
          aria-describedby="fp-rules"
        />
        <div aria-hidden="true" className="flex gap-1">
          {[0, 1, 2, 3].map((bar) => (
            <span key={bar} className={cn("h-[5px] flex-1 rounded-full", password && bar < Math.max(1, score) ? barTone(score) : "bg-line-3")} />
          ))}
        </div>
        <ul id="fp-rules" className="m-0 flex list-none gap-3.5 p-0">
          {rules.map((rule) => (
            <li key={rule.key} className={cn("text-[13px]", rule.met ? "text-success" : attempted ? "text-danger" : "text-ink-3")}>
              <span aria-hidden="true" className="font-bold">
                {rule.met ? "✓" : "•"}
              </span>{" "}
              {t(`rules.${rule.key}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="fp-again" className="text-[15px] font-semibold">
          {t("again")}
        </label>
        <TextInput
          id="fp-again"
          type={isVisible ? "text" : "password"}
          autoComplete="new-password"
          value={again}
          onChange={(event) => setAgain(event.target.value)}
          invalid={again !== "" && !matches}
        />
        {again && <span className={cn("text-[13px] font-semibold", matches ? "text-success" : "text-danger")}>{matches ? t("matches") : t("mismatch")}</span>}
      </div>

      <NoteBox className="flex items-start gap-2">
        <Icon name="info" size={16} strokeWidth={2} className="mt-0.5" />
        <span>{t("signOutNote")}</span>
      </NoteBox>

      {error && (
        <p role="alert" className="m-0 text-sm text-danger">
          {error}
        </p>
      )}
      <SubmitButton isSubmitting={isPending} label={t("submit")} submittingLabel={t("submitting")} />
    </form>
  );
}
