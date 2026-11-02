"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePhoneAction } from "@/app/(dashboardLayout)/(home)/profile/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { displayPhone, normalizePhone } from "@/lib/phone";

// "মোবাইল নম্বর বদলান" (board Profile): the new login number, confirmed with the password.
export function PhoneDialog({ current, onClose }: { current: string; onClose: () => void }) {
  const t = useTranslations("Profile.phone");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const normalized = normalizePhone(phone);
  const phoneError = errors.phone ?? (!tried ? undefined : !normalized ? t("bad") : normalized === current ? t("same") : undefined);
  const passwordError = errors.password ?? (tried && !password ? t("passwordMissing") : undefined);

  const save = () =>
    startTransition(async () => {
      setTried(true);
      if (!normalized || normalized === current || !password) return;
      const result = await changePhoneAction(normalized, password);
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        if (!result.fieldErrors) toast.error(result.message);
        return;
      }
      toast.success(t("done", { phone: displayPhone(normalized) }));
      onClose();
      router.refresh();
    });

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("sub")}
      closeLabel={t("close")}
      onClose={onClose}
      size="xs"
      topClass="top-35"
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <LabeledInput
        id="ph-new"
        type="tel"
        inputMode="tel"
        placeholder="01XXX-XXXXXX"
        label={t("newPhone")}
        value={phone}
        onChange={(event) => {
          setPhone(event.target.value);
          setErrors({});
        }}
        error={phoneError}
      />
      <LabeledInput
        id="ph-pw"
        password
        autoComplete="current-password"
        label={t("password")}
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setErrors({});
        }}
        error={passwordError}
      />
      <p className="m-0 text-[13px] leading-[1.55] text-ink-3">{t("note")}</p>
    </FormDialog>
  );
}
