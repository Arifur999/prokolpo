"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useMessages, useTranslations } from "next-intl";
import { useState } from "react";
import { registerAction } from "@/app/(auth)/register/_action";
import { FieldMessage } from "@/components/shared/form/FieldMessage";
import { visibleFieldError } from "@/components/shared/form/fieldError";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { normalizePhone } from "@/lib/phone";
import { ROUTES } from "@/lib/routes";
import type { ApiErrorResponse } from "@/types/api.types";
import { registerFormSchema, type IRegisterFormValues } from "@/zod/auth.validation";
import { SubmitButton } from "../SubmitButton";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

const DEFAULTS: IRegisterFormValues = {
  companyName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

type FieldName = keyof IRegisterFormValues;

export function RegisterForm() {
  const t = useTranslations("Auth.register");
  const schema = registerFormSchema(useMessages().Auth.validation);
  const [failure, setFailure] = useState<ApiErrorResponse | null>(null);
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldName, string>>>({});

  const form = useForm({
    defaultValues: DEFAULTS,
    validators: { onBlur: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      // Success redirects inside the action; anything that comes back is a failure.
      const result = await registerAction(value);
      setFailure(result.fieldErrors ? null : result);
      setServerErrors(result.fieldErrors ?? {});
    },
  });

  // A server error belongs to the value it was about; editing the field clears it.
  const clearServerError = (name: FieldName) => {
    if (!serverErrors[name]) return;
    setServerErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {failure && (
        <div role="alert" className="rounded-xl border border-danger-line bg-danger-tint px-4 py-3 text-[15px] font-semibold text-danger-ink">
          {failure.message}
        </div>
      )}

      <form.Subscribe selector={(state) => state.submissionAttempts > 0}>
        {(submitted) => {
          const errorOf = (name: FieldName, meta: { errors: unknown[]; isBlurred: boolean }) => visibleFieldError(meta, submitted, serverErrors[name]);
          return (
            <>
              <form.Field name="companyName">
                {(field) => (
                  <LabeledInput
                    id="rg-company"
                    label={t("company")}
                    labelNote={t("optional")}
                    autoComplete="organization"
                    placeholder={t("companyPlaceholder")}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    error={errorOf("companyName", field.state.meta)}
                    hint={t("companyHelp")}
                  />
                )}
              </form.Field>

              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                <form.Field name="firstName">
                  {(field) => (
                    <LabeledInput
                      id="rg-first"
                      label={t("firstName")}
                      autoComplete="given-name"
                      placeholder={t("firstPlaceholder")}
                      aria-required
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      error={errorOf("firstName", field.state.meta)}
                    />
                  )}
                </form.Field>
                <form.Field name="lastName">
                  {(field) => (
                    <LabeledInput
                      id="rg-last"
                      label={t("lastName")}
                      autoComplete="family-name"
                      placeholder={t("lastPlaceholder")}
                      aria-required
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      error={errorOf("lastName", field.state.meta)}
                    />
                  )}
                </form.Field>
              </div>

              <form.Field name="email">
                {(field) => (
                  <LabeledInput
                    id="rg-email"
                    type="email"
                    label={t("email")}
                    labelNote={t("optional")}
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    value={field.state.value}
                    onChange={(event) => {
                      clearServerError("email");
                      field.handleChange(event.target.value);
                    }}
                    onBlur={field.handleBlur}
                    error={errorOf("email", field.state.meta)}
                  />
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => {
                  const error = errorOf("phone", field.state.meta);
                  const normalized = normalizePhone(field.state.value);
                  const savedAs = !error && normalized && normalized !== field.state.value.trim() ? t("phoneSavedAs", { phone: normalized }) : undefined;
                  return (
                    <LabeledInput
                      id="rg-phone"
                      type="tel"
                      label={t("phone")}
                      autoComplete="tel"
                      placeholder={t("phonePlaceholder")}
                      aria-required
                      value={field.state.value}
                      onChange={(event) => {
                        clearServerError("phone");
                        field.handleChange(event.target.value);
                      }}
                      onBlur={field.handleBlur}
                      error={error}
                      success={savedAs}
                    />
                  );
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <LabeledInput
                    id="rg-pass"
                    password
                    label={t("password")}
                    autoComplete="new-password"
                    placeholder={t("passwordPlaceholder")}
                    aria-required
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    error={errorOf("password", field.state.meta)}
                    hint={t("passwordHelp")}
                    below={<PasswordStrengthMeter password={field.state.value} />}
                  />
                )}
              </form.Field>

              <form.Field name="confirmPassword">
                {(field) => {
                  const error = errorOf("confirmPassword", field.state.meta);
                  const matches = !error && field.state.value !== "" && field.state.value === field.form.getFieldValue("password");
                  return (
                    <LabeledInput
                      id="rg-pass2"
                      password
                      label={t("confirm")}
                      autoComplete="new-password"
                      placeholder={t("confirmPlaceholder")}
                      aria-required
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      error={error}
                      success={matches ? t("confirmOk") : undefined}
                    />
                  );
                }}
              </form.Field>

              <form.Field name="acceptTerms">
                {(field) => {
                  const error = errorOf("acceptTerms", field.state.meta);
                  return (
                    <div className="flex flex-col gap-1.5">
                      <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
                        <input
                          type="checkbox"
                          checked={field.state.value}
                          onChange={(event) => field.handleChange(event.target.checked)}
                          onBlur={field.handleBlur}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? "rg-agree-msg" : undefined}
                          className="mt-[3px] size-5 shrink-0 accent-brand"
                        />
                        <span>
                          {t("termsBefore")}{" "}
                          <Link href={ROUTES.terms} className="font-semibold">
                            {t("termsLink")}
                          </Link>{" "}
                          {t("termsAfter")}
                        </span>
                      </label>
                      {error && (
                        <FieldMessage id="rg-agree-msg" tone="error" className="ml-7.5">
                          {error}
                        </FieldMessage>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            </>
          );
        }}
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <SubmitButton isSubmitting={isSubmitting} label={t("submit")} submittingLabel={t("submitting")} className="mt-1" />}
      </form.Subscribe>
    </form>
  );
}
