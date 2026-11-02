"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { resetPasswordAction, resetWithCodeAction } from "@/app/(auth)/reset-password/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { PasswordMeter } from "@/components/shared/form/PasswordMeter";
import { TextInput } from "@/components/shared/form/TextInput";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AuthHeading } from "../AuthHeading";
import { SubmitButton } from "../SubmitButton";
import { CenteredState, NoteBox } from "./CenteredState";

// Who the code came from, when the password is reset with an owner's code instead of a link.
type CodeFrom = { phone: string; ownerName: string };

type NewPasswordFormProps = { token: string; maskedEmail: string | null; codeFrom?: never } | { token?: never; maskedEmail?: never; codeFrom: CodeFrom };

// The new-password step, from an emailed link (board ResetPassword) or with the 6-digit
// code a project's owner gave (board ForgotCode).
export function NewPasswordForm({ token, maskedEmail, codeFrom }: NewPasswordFormProps) {
  const t = useTranslations("Auth.reset");
  const tf = useTranslations("Auth.forgot");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
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
          {codeFrom ? tf("codeDoneBody") : t("doneBody")}
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

  const matches = again !== "" && again === password;

  const codeDigits = code.replace(/\s/g, "");
  const submit = () =>
    startTransition(async () => {
      setAttempted(true);
      if (codeFrom && codeDigits.length !== 6) return setCodeError(tf("codeShort"));
      const values = { password, confirmPassword: again };
      const result = codeFrom ? await resetWithCodeAction(codeFrom.phone, codeDigits, values) : await resetPasswordAction(token ?? "", values);
      if (result.success) return setIsDone(true);
      if (result.fieldErrors?.code || result.code?.startsWith("RESET_CODE")) return setCodeError(result.fieldErrors?.code ?? result.message);
      setError(result.fieldErrors?.password ?? result.fieldErrors?.confirmPassword ?? result.message);
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
      {codeFrom ? (
        <>
          <AuthHeading title={tf("codeTitle")} subtitle={tf("codeHint", { owner: codeFrom.ownerName })} />
          <div className="flex flex-col gap-2">
            <label htmlFor="fp-code" className="text-[15px] font-semibold">
              {tf("code")}
            </label>
            <input
              id="fp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="••• •••"
              value={code}
              aria-invalid={!!codeError}
              aria-describedby={codeError ? "fp-code-error" : undefined}
              onChange={(event) => {
                setCode(event.target.value.replace(/[^0-9০-৯ ]/g, "").slice(0, 7));
                setCodeError(undefined);
              }}
              className={cn(
                "h-14 w-55 rounded-xl border-2 bg-white px-3.5 text-[26px] font-bold tracking-[0.25em] text-ink outline-none",
                codeError ? "border-danger-strong" : "border-brand",
              )}
            />
            {codeError && (
              <span id="fp-code-error" className="text-[13px] text-danger">
                {codeError}
              </span>
            )}
          </div>
        </>
      ) : (
        <AuthHeading title={t("title")} subtitle={maskedEmail ? t("fromLink", { email: maskedEmail }) : t("fromLinkNoEmail")} />
      )}

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
        <PasswordMeter id="fp-rules" password={password} attempted={attempted} />
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

      {!codeFrom && (
        <NoteBox className="flex items-start gap-2">
          <Icon name="info" size={16} strokeWidth={2} className="mt-0.5" />
          <span>{t("signOutNote")}</span>
        </NoteBox>
      )}

      {error && (
        <p role="alert" className="m-0 text-sm text-danger">
          {error}
        </p>
      )}
      <SubmitButton isSubmitting={isPending} label={t("submit")} submittingLabel={t("submitting")} />
    </form>
  );
}
