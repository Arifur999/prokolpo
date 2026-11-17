"use client";

import { useTranslations } from "next-intl";
import { FormSection } from "@/components/shared/form/FormSection";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { TextArea } from "@/components/shared/form/TextArea";
import type { NewProjectValues } from "./newProjectValues";
import type { CheckedField } from "./useNewProjectErrors";

type ProjectInfoFieldsProps = {
  values: NewProjectValues;
  set: (patch: Partial<NewProjectValues>) => void;
  errorOf: (field: CheckedField) => string | undefined;
  touch: (field: CheckedField) => void;
};

// Name, address and a short description.
export function ProjectInfoFields({ values, set, errorOf, touch }: ProjectInfoFieldsProps) {
  const t = useTranslations("NewProject");

  return (
    <FormSection id="np-info-title" title={t("infoTitle")} className="gap-4">
      <LabeledInput
        id="np-name"
        label={t("name")}
        aria-required="true"
        placeholder={t("namePlaceholder")}
        value={values.name}
        onChange={(event) => set({ name: event.target.value })}
        onBlur={() => touch("name")}
        error={errorOf("name")}
      />
      <LabeledInput
        id="np-location"
        label={t("location")}
        aria-required="true"
        placeholder={t("locationPlaceholder")}
        value={values.location}
        onChange={(event) => set({ location: event.target.value })}
        onBlur={() => touch("location")}
        error={errorOf("location")}
      />
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
          className="min-h-22 resize-none px-3.5 py-3 text-base leading-[normal]"
        />
      </div>
    </FormSection>
  );
}
