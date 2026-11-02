"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { saveReceiptAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { cn } from "@/lib/utils";
import { PAPERS, RECEIPT_LANGS, type IReceiptPayload, type IReceiptSettings } from "@/types/settings.types";
import { ReceiptPreview } from "./ReceiptPreview";
import { SaveBar } from "./SaveBar";
import { SettingsCard } from "./SettingsCard";
import { useSettingsSave } from "./useSettingsSave";

const PREFIX = /^[A-Z]{2,5}$/;

const valuesOf = (r: IReceiptSettings): IReceiptPayload => ({
  company: r.company,
  address: r.address,
  phone: r.phone,
  prefix: r.prefix,
  lang: r.lang,
  paper: r.paper,
  footer: r.footer,
});

// "রশিদ ও প্রিন্ট" (board SettingsReceipt): what deposit and installment receipts print, with
// a live preview of their top and of the reminder message.
type ReceiptTabProps = { projectId: string; projectName: string; receipt: IReceiptSettings; canEdit: boolean; today: string };

export function ReceiptTab({ projectId, projectName, receipt, canEdit, today }: ReceiptTabProps) {
  const t = useTranslations("Settings.receipt");
  const saved = valuesOf(receipt);
  const [values, setValues] = useState(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useSettingsSave();
  const set = (patch: Partial<IReceiptPayload>) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors({});
  };

  const clean = JSON.stringify(values) === JSON.stringify(saved);
  const prefixOk = PREFIX.test(values.prefix);
  const save = () =>
    run(
      () => saveReceiptAction(projectId, values),
      t("saved"),
      (result) => !result.success && setErrors(result.fieldErrors ?? {}),
    );
  const choice = (on: boolean) =>
    cn(
      "h-10 cursor-pointer rounded-lg px-3.5 text-sm text-ink",
      on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
    );

  return (
    <SettingsCard
      id="st-receipt"
      title={t("title")}
      sub={t("sub")}
      footer={
        canEdit && <SaveBar clean={clean} problem={prefixOk ? undefined : t("prefixBad")} pending={isPending} onReset={() => setValues(saved)} onSave={save} />
      }
    >
      <div className="grid grid-cols-1 gap-5.5 px-5.5 py-4.5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <fieldset disabled={!canEdit} className="m-0 flex min-w-0 flex-col gap-3.5 border-none p-0">
          <LabeledInput
            id="r-co"
            label={t("company")}
            value={values.company}
            maxLength={80}
            onChange={(e) => set({ company: e.target.value })}
            hint={t("companyHint")}
            error={errors.company}
          />
          <LabeledInput
            id="r-ad"
            label={t("address")}
            value={values.address}
            maxLength={160}
            onChange={(e) => set({ address: e.target.value })}
            error={errors.address}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabeledInput
              id="r-ph"
              type="tel"
              label={t("phone")}
              value={values.phone}
              maxLength={30}
              onChange={(e) => set({ phone: e.target.value })}
              error={errors.phone}
            />
            <LabeledInput
              id="r-px"
              label={t("prefix")}
              value={values.prefix}
              maxLength={5}
              onChange={(e) =>
                set({
                  prefix: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 5),
                })
              }
              inputClassName="font-semibold uppercase"
              hint={t("prefixHelp")}
              error={prefixOk ? errors.prefix : t("prefixBad")}
            />
          </div>
          <div role="radiogroup" aria-labelledby="r-lang" aria-describedby="r-lang-help" className="flex flex-col gap-1.5">
            <span id="r-lang" className="text-[15px] font-semibold">
              {t("lang")}
            </span>
            <div className="flex flex-wrap gap-2">
              {RECEIPT_LANGS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  role="radio"
                  aria-checked={values.lang === lang}
                  lang={lang === "en" ? "en" : "bn"}
                  onClick={() => set({ lang })}
                  className={choice(values.lang === lang)}
                >
                  {t(`langs.${lang}`)}
                </button>
              ))}
            </div>
            <span id="r-lang-help" className="text-xs leading-normal text-ink-3">
              {t("langHelp")}
            </span>
          </div>
          <div role="radiogroup" aria-labelledby="r-paper" className="flex flex-col gap-1.5">
            <span id="r-paper" className="text-[15px] font-semibold">
              {t("paper")}
            </span>
            <div className="flex flex-wrap gap-2">
              {PAPERS.map((paper) => (
                <button
                  key={paper}
                  type="button"
                  role="radio"
                  aria-checked={values.paper === paper}
                  onClick={() => set({ paper })}
                  className={choice(values.paper === paper)}
                >
                  {t(`papers.${paper}`)}
                </button>
              ))}
            </div>
          </div>
          <LabeledInput
            id="r-ft"
            label={t("footer")}
            labelNote={t("optional")}
            placeholder={t("footerPlaceholder")}
            value={values.footer}
            maxLength={160}
            onChange={(e) => set({ footer: e.target.value })}
            error={errors.footer}
          />
        </fieldset>
        <ReceiptPreview projectName={projectName} values={values} next={receipt.next} prefix={prefixOk ? values.prefix : saved.prefix} today={today} />
      </div>
    </SettingsCard>
  );
}
