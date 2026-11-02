"use client";

import { useTranslations } from "next-intl";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { TextArea } from "@/components/shared/form/TextArea";
import { DateField } from "@/components/shared/form/DateField";
import { FormSection } from "@/components/shared/form/FormSection";
import type { NewProjectValues } from "./newProjectValues";

type ProjectInfoFieldsProps = {
  values: NewProjectValues;
  set: (patch: Partial<NewProjectValues>) => void;
  nameError?: string;
  onNameBlur: () => void;
};

// Name, place, start date and a short description.
export function ProjectInfoFields({ values, set, nameError, onNameBlur }: ProjectInfoFieldsProps) {
  const t = useTranslations("NewProject");

  return (
    <FormSection id="np-info-title" title={t("infoTitle")} className="gap-4">
      <LabeledInput
        id="np-name"
        label={t("name")}
        aria-required="true"
        placeholder={t(`kinds.${values.kind}.namePlaceholder`)}
        value={values.name}
        onChange={(event) => set({ name: event.target.value })}
        onBlur={onNameBlur}
        error={nameError}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
        <LabeledInput
          id="np-location"
          label={t("location")}
          labelNote={t("optional")}
          placeholder={t("locationPlaceholder")}
          value={values.location}
          onChange={(event) => set({ location: event.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="np-start" className="text-[15px] font-semibold">
            {t("startDate")}
          </label>
          <DateField id="np-start" value={values.startDate} onChange={(startDate) => set({ startDate })} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="np-desc" className="text-[15px] font-semibold">
          {t("description")} <span className="font-normal text-ink-3">{t("optional")}</span>
        </label>
        <TextArea
          id="np-desc"
          rows={3}
          placeholder={t(`kinds.${values.kind}.descPlaceholder`)}
          value={values.description}
          onChange={(event) => set({ description: event.target.value })}
          className="min-h-22 resize-none px-3.5 py-3 text-base"
        />
      </div>
    </FormSection>
  );
}
