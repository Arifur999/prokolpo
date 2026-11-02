"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useMessages, useTranslations } from "next-intl";
import { useState } from "react";
import { loginAction } from "@/app/(auth)/login/_action";
import { FieldMessage } from "@/components/shared/form/FieldMessage";
import { visibleFieldError } from "@/components/shared/form/fieldError";
import { FormField } from "@/components/shared/form/FormField";
import { PasswordInput } from "@/components/shared/form/PasswordInput";
import { TextInput } from "@/components/shared/form/TextInput";
import { ROUTES } from "@/lib/routes";
import { AUTH_ERROR_CODES } from "@/types/auth.types";
import type { ApiErrorResponse } from "@/types/api.types";
import { loginFormSchema, type ILoginFormValues } from "@/zod/auth.validation";
import { SubmitButton } from "../SubmitButton";
import { SuspendedNotice } from "./SuspendedNotice";

const DEFAULTS: ILoginFormValues = { identifier: "", password: "", remember: true };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations("Auth.login");
  const validation = useMessages().Auth.validation;
  const [failure, setFailure] = useState<ApiErrorResponse | null>(null);

  const form = useForm({
    defaultValues: DEFAULTS,
    validators: { onSubmit: loginFormSchema(validation) },
    // Success redirects inside the action; anything that comes back is a failure.
    onSubmit: async ({ value }) => setFailure(await loginAction(value, redirectTo)),
  });

  const isSuspended = failure?.code === AUTH_ERROR_CODES.accountSuspended;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      {isSuspended && <SuspendedNotice />}
      {failure && !isSuspended && (
        <div role="alert" className="rounded-xl border border-danger-line bg-danger-tint px-4 py-3 text-[15px] font-semibold text-danger-ink">
          {failure.message}
        </div>
      )}

      <form.Subscribe selector={(state) => state.submissionAttempts > 0}>
        {(submitted) => (
          <>
            <form.Field name="identifier">
              {(field) => {
                const error = visibleFieldError(field.state.meta, submitted);
                return (
                  <FormField id="login-id" label={t("identifier")} className="gap-2">
                    <TextInput
                      id="login-id"
                      type="text"
                      autoComplete="username"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      invalid={Boolean(error)}
                      aria-describedby={error ? "login-id-msg" : undefined}
                    />
                    {error && (
                      <FieldMessage id="login-id-msg" tone="error">
                        {error}
                      </FieldMessage>
                    )}
                  </FormField>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const error = visibleFieldError(field.state.meta, submitted);
                return (
                  <FormField
                    id="login-pass"
                    label={t("password")}
                    labelAside={
                      <Link href={ROUTES.forgotPassword} className="text-sm font-semibold no-underline">
                        {t("forgot")}
                      </Link>
                    }
                  >
                    <PasswordInput
                      id="login-pass"
                      autoComplete="current-password"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      invalid={Boolean(error)}
                      aria-describedby={error ? "login-pass-msg" : undefined}
                    />
                    {error && (
                      <FieldMessage id="login-pass-msg" tone="error">
                        {error}
                      </FieldMessage>
                    )}
                  </FormField>
                );
              }}
            </form.Field>
          </>
        )}
      </form.Subscribe>

      <form.Field name="remember">
        {(field) => (
          <label className="flex min-h-7 cursor-pointer items-center gap-2.5 text-[15px]">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(event) => field.handleChange(event.target.checked)}
              className="m-0 size-5 shrink-0 accent-brand"
            />
            {t("remember")} <span className="text-[13px] text-ink-3">{t("rememberHint")}</span>
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <SubmitButton isSubmitting={isSubmitting} label={t("submit")} submittingLabel={t("submitting")} />}
      </form.Subscribe>
    </form>
  );
}
