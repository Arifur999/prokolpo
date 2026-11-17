"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FieldMessage } from "@/components/shared/form/FieldMessage";
import { FormField } from "@/components/shared/form/FormField";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { PasswordInput } from "@/components/shared/form/PasswordInput";
import { Icon } from "@/components/shared/icon/Icon";
import { generateManagerPassword } from "@/lib/managerPassword";
import type { NewProjectValues } from "./newProjectValues";
import type { CheckedField } from "./useNewProjectErrors";

export type ManagerLoginFieldsProps = {
  values: NewProjectValues;
  set: (patch: Partial<NewProjectValues>) => void;
  errorOf: (field: CheckedField) => string | undefined;
  touch: (field: CheckedField) => void;
  // Set once the project is made: the login to hand over. The password lives only here.
  created: { phone: string; password: string } | null;
};

// Name, number and password of the manager's login, whether they may add staff, and once the
// project is made, the details to give them.
export function ManagerLoginFields({ values, set, errorOf, touch, created }: ManagerLoginFieldsProps) {
  const t = useTranslations("NewProject.manager");
  const [showPassword, setShowPassword] = useState(true);
  const passwordError = errorOf("managerPassword");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <LabeledInput
          id="np-mgr-name"
          label={t("name")}
          aria-required="true"
          placeholder={t("namePlaceholder")}
          value={values.managerName}
          onChange={(event) => set({ managerName: event.target.value })}
          onBlur={() => touch("managerName")}
          error={errorOf("managerName")}
        />
        <LabeledInput
          id="np-mgr-phone"
          label={t("phone")}
          type="tel"
          inputMode="numeric"
          aria-required="true"
          placeholder={t("phonePlaceholder")}
          value={values.managerPhone}
          onChange={(event) => set({ managerPhone: event.target.value })}
          onBlur={() => touch("managerPhone")}
          error={errorOf("managerPhone")}
        />
      </div>

      <FormField id="np-mgr-pass" label={t("password")}>
        <div className="flex gap-2.5">
          <div className="grow">
            <PasswordInput
              id="np-mgr-pass"
              autoComplete="new-password"
              aria-required="true"
              placeholder={t("passwordPlaceholder")}
              value={values.managerPassword}
              onChange={(event) => set({ managerPassword: event.target.value })}
              onBlur={() => touch("managerPassword")}
              invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "np-mgr-pass-msg" : undefined}
              visible={showPassword}
              onVisibleChange={setShowPassword}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              set({ managerPassword: generateManagerPassword() });
              setShowPassword(true);
            }}
            className="h-12 shrink-0 cursor-pointer rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-brand"
          >
            {t("generate")}
          </button>
        </div>
        {passwordError && (
          <FieldMessage id="np-mgr-pass-msg" tone="error">
            {passwordError}
          </FieldMessage>
        )}
      </FormField>

      <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
        <input
          type="checkbox"
          checked={values.managerCanAddStaff}
          onChange={(event) => set({ managerCanAddStaff: event.target.checked })}
          className="m-0 mt-0.5 size-5 shrink-0 accent-brand"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">{t("staff")}</span>
          <span className="text-[13px] text-ink-3">{t("staffBody")}</span>
        </span>
      </label>

      <p className="m-0 flex items-start gap-2.5 rounded-lg bg-gold-tint px-3.5 py-3 text-sm leading-[1.55] text-gold-deep">
        <Icon name="lock" size={18} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span>{t("lockNote")}</span>
      </p>

      {created && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-success-line bg-brand-wash px-4 py-3.5">
          <strong className="text-[15px] text-brand">{t("doneTitle")}</strong>
          <span className="flex flex-wrap gap-x-5 gap-y-1.5 text-[15px]">
            <span>
              {t("donePhone")} <strong>{created.phone}</strong>
            </span>
            <span>
              {t("donePassword")} <strong>{created.password}</strong>
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
