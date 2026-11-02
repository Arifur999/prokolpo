"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { resetOptionsAction } from "@/app/(auth)/forgot-password/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import type { IResetOptions } from "@/types/auth.types";
import { SubmitButton } from "../SubmitButton";
import { AuthHeading } from "../AuthHeading";

export type FoundAccount = IResetOptions & { phone: string };

export function PhoneStep({ initialPhone, onFound }: { initialPhone: string; onFound: (account: FoundAccount) => void }) {
  const t = useTranslations("Auth.forgot");
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const submit = () =>
    startTransition(async () => {
      const result = await resetOptionsAction(phone);
      if (result.success) onFound(result.data);
      else setError(result.fieldErrors?.phone ?? result.message);
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
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />
      <LabeledInput
        id="fp-phone"
        type="tel"
        inputMode="tel"
        autoComplete="username"
        label={t("phone")}
        placeholder={t("phonePlaceholder")}
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          setError(undefined);
        }}
        error={error}
        className="gap-2"
      />
      <SubmitButton isSubmitting={isPending} label={t("next")} submittingLabel={t("checking")} />
    </form>
  );
}
