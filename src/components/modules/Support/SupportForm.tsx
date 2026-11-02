"use client";

import { useForm } from "@tanstack/react-form";
import { useMessages, useTranslations } from "next-intl";
import { useState } from "react";
import { supportRequestAction } from "@/app/(auth)/support/_action";
import { FieldMessage } from "@/components/shared/form/FieldMessage";
import { visibleFieldError } from "@/components/shared/form/fieldError";
import { FormField } from "@/components/shared/form/FormField";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { TextArea } from "@/components/shared/form/TextArea";
import { Icon } from "@/components/shared/icon/Icon";
import type { ISupportReceipt } from "@/types/support.types";
import { supportRequestSchema, type ISupportFormValues } from "@/zod/support.validation";
import { AuthHeading } from "../Auth/AuthHeading";
import { SubmitButton } from "../Auth/SubmitButton";
import { SupportBackLink } from "./SupportBackLink";
import { SupportSent } from "./SupportSent";
import { TopicPicker } from "./TopicPicker";

// Support's inputs are a touch smaller than the sign-in ones (46px, 15px text).
const COMPACT_INPUT = "h-11.5 px-3 text-[15px]";

type SupportFormProps = {
  defaults: ISupportFormValues;
  // The blue note at the top, chosen by where the person came from.
  note?: string;
  // Signed-in senders' details come from their account and stay as they are.
  isAccountLocked: boolean;
};

export function SupportForm({ defaults, note, isAccountLocked }: SupportFormProps) {
  const t = useTranslations("Support");
  const schema = supportRequestSchema(useMessages().Support.validation);
  const [receipt, setReceipt] = useState<ISupportReceipt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const form = useForm({
    defaultValues: defaults,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const result = await supportRequestAction(value);
      if (result.success) setReceipt(result.data);
      else setFailure(result.message);
    },
  });

  if (receipt) {
    return <SupportSent reference={receipt.reference} phone={receipt.phone} topic={form.state.values.topic} source={defaults.source} />;
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-4.5"
    >
      <SupportBackLink source={defaults.source} />
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />
      {note && (
        <p className="m-0 flex items-start gap-2.5 rounded-lg bg-info-tint px-3 py-2.5 text-[13px] leading-[1.55] text-info-deep">
          <Icon name="info" size={16} strokeWidth={2} className="mt-0.5" />
          <span>{note}</span>
        </p>
      )}
      {failure && (
        <p role="alert" className="m-0 rounded-lg border border-danger-line bg-danger-tint px-3 py-2.5 text-sm font-semibold text-danger-ink">
          {failure}
        </p>
      )}

      <form.Subscribe selector={(state) => state.submissionAttempts > 0}>
        {(submitted) => (
          <>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <form.Field name="name">
                {(field) => (
                  <LabeledInput
                    id="su-name"
                    label={t("name")}
                    autoComplete="name"
                    placeholder={t("namePlaceholder")}
                    value={field.state.value}
                    readOnly={isAccountLocked}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    error={visibleFieldError(field.state.meta, submitted)}
                    inputClassName={COMPACT_INPUT}
                  />
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <LabeledInput
                    id="su-phone"
                    type="tel"
                    inputMode="tel"
                    label={t("phone")}
                    autoComplete="tel"
                    placeholder={t("phonePlaceholder")}
                    value={field.state.value}
                    readOnly={isAccountLocked}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    error={visibleFieldError(field.state.meta, submitted)}
                    hint={t("phoneHelp")}
                    inputClassName={COMPACT_INPUT}
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="email">
              {(field) => (
                <LabeledInput
                  id="su-email"
                  type="email"
                  label={t("email")}
                  labelNote={t("optional")}
                  autoComplete="email"
                  placeholder={t("emailPlaceholder")}
                  value={field.state.value}
                  readOnly={isAccountLocked}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  error={visibleFieldError(field.state.meta, submitted)}
                  inputClassName={COMPACT_INPUT}
                />
              )}
            </form.Field>

            <form.Field name="topic">{(field) => <TopicPicker value={field.state.value} onChange={field.handleChange} />}</form.Field>

            <form.Field name="message">
              {(field) => {
                const error = visibleFieldError(field.state.meta, submitted);
                return (
                  <FormField id="su-msg" label={t("message")}>
                    <TextArea
                      id="su-msg"
                      rows={4}
                      placeholder={t(`messageHints.${form.state.values.topic}`)}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      invalid={Boolean(error)}
                      aria-describedby={error ? "su-msg-msg" : undefined}
                    />
                    {error && (
                      <FieldMessage id="su-msg-msg" tone="error">
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

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <SubmitButton isSubmitting={isSubmitting} label={t("submit")} submittingLabel={t("submitting")} />}
      </form.Subscribe>
      <p className="m-0 flex items-start gap-2 text-[13px] leading-[1.55] text-ink-2">
        <Icon name="shieldCheck" size={16} strokeWidth={2} className="mt-0.5 text-success" />
        <span>{t("safety")}</span>
      </p>
    </form>
  );
}
