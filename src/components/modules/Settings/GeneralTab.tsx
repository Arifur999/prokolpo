"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { saveGeneralAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { DateField } from "@/components/shared/form/DateField";
import { FormField } from "@/components/shared/form/FormField";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { TextArea } from "@/components/shared/form/TextArea";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { PROJECT_STATUSES, type ProjectStatus } from "@/types/project.types";
import type { IGeneralPayload, ISettingsGeneral } from "@/types/settings.types";
import { SaveBar } from "./SaveBar";
import { SettingsCard } from "./SettingsCard";
import { useSettingsSave } from "./useSettingsSave";

const DOT: Record<ProjectStatus, string> = { ACTIVE: "bg-brand-mid", ON_HOLD: "bg-gold-strong", DONE: "bg-ink-5" };

const valuesOf = (g: ISettingsGeneral): IGeneralPayload => ({
  name: g.name,
  location: g.location ?? "",
  description: g.description ?? "",
  startDate: g.startDate,
  status: g.status,
});

// "প্রজেক্টের তথ্য" (board Settings): what the project is (fixed), then its name, place,
// start, description and status.
export function GeneralTab({ projectId, general, canEdit }: { projectId: string; general: ISettingsGeneral; canEdit: boolean }) {
  const t = useTranslations("Settings.general");
  const tp = useTranslations("Projects");
  const saved = valuesOf(general);
  const [values, setValues] = useState(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { run, isPending } = useSettingsSave();
  const set = (patch: Partial<IGeneralPayload>) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors({});
  };

  const clean = JSON.stringify(values) === JSON.stringify(saved);
  const nameShort = [...values.name.trim()].length < 3 ? t("nameShort") : undefined;
  const nameError = nameShort ?? errors.name;
  const kind = [tp(`kind.${general.kind}`), general.floors ? t("floors", { count: general.floors }) : general.businessType].filter(Boolean).join(" · ");
  const ownership = [tp(`ownership.${general.ownership}`), general.ownership === "PARTNERSHIP" && t("partners", { count: general.partners })]
    .filter(Boolean)
    .join(" · ");

  const save = () =>
    run(
      () => saveGeneralAction(projectId, values),
      t("saved"),
      (result) => !result.success && setErrors(result.fieldErrors ?? {}),
    );

  return (
    <SettingsCard
      id="st-general"
      title={t("title")}
      footer={canEdit && <SaveBar clean={clean} problem={nameShort} pending={isPending} onReset={() => setValues(saved)} onSave={save} />}
    >
      <fieldset disabled={!canEdit} className="m-0 flex min-w-0 flex-col gap-4 border-none px-5.5 py-4.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: t("kind"), value: kind, icon: "building" as const },
            { label: t("ownership"), value: ownership, icon: "users" as const },
          ].map((fact) => (
            <div key={fact.label} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
              <Icon name={fact.icon} size={20} strokeWidth={2} className="text-ink-2" />
              <span className="flex grow flex-col">
                <span className="text-xs text-ink-3">{fact.label}</span>
                <strong className="text-[15px] font-semibold">{fact.value}</strong>
              </span>
              <Icon name="lock" size={16} strokeWidth={2} className="text-ink-4" />
            </div>
          ))}
        </div>
        <p className="-mt-1.5 mb-0 text-xs text-ink-3">{t("fixed")}</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <LabeledInput
            id="st-name"
            className="sm:col-span-2"
            label={t("name")}
            labelNote={<span className="text-danger">*</span>}
            value={values.name}
            maxLength={80}
            onChange={(e) => set({ name: e.target.value })}
            error={nameError}
          />
          <LabeledInput
            id="st-addr"
            label={t("location")}
            value={values.location}
            maxLength={120}
            onChange={(e) => set({ location: e.target.value })}
            error={errors.location}
          />
          <FormField id="st-start" label={t("start")}>
            <DateField id="st-start" value={values.startDate} onChange={(startDate) => set({ startDate })} />
          </FormField>
          <FormField id="st-desc" label={t("description")} labelNote={t("optional")} className="sm:col-span-2">
            <TextArea id="st-desc" rows={2} maxLength={500} value={values.description} onChange={(e) => set({ description: e.target.value })} />
          </FormField>
        </div>
        <div role="radiogroup" aria-labelledby="st-status" className="flex flex-col gap-2">
          <span id="st-status" className="text-[15px] font-semibold">
            {t("status")}
          </span>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {PROJECT_STATUSES.map((status) => {
              const on = values.status === status;
              return (
                <label
                  key={status}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl",
                    on ? "border-2 border-brand bg-brand-wash px-3.25 py-2.75" : "border border-line bg-white px-3.5 py-3",
                  )}
                >
                  <input type="radio" name="st-status" checked={on} onChange={() => set({ status })} className="m-0 mt-0.75 size-4.5 shrink-0 accent-brand" />
                  <span className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                      <span aria-hidden="true" className={cn("size-2 rounded-full", DOT[status])} />
                      {tp(`status.${status}`)}
                    </span>
                    <span className="text-xs leading-[1.45] text-ink-3">{t(`statusSub.${status}`)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>
    </SettingsCard>
  );
}
