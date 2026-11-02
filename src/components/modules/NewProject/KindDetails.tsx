"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Stepper } from "@/components/shared/form/Stepper";
import { TextInput } from "@/components/shared/form/TextInput";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { FARM_TYPES, LAND_UNITS } from "@/types/project.types";
import { BudgetField } from "./BudgetField";
import { FormSection } from "@/components/shared/form/FormSection";
import type { NewProjectValues } from "./newProjectValues";

type KindDetailsProps = {
  values: NewProjectValues;
  set: (patch: Partial<NewProjectValues>) => void;
};

function Field({ id, label, optional, help, children }: { id: string; label: string; optional: string; help?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label} <span className="font-normal text-ink-3">{optional}</span>
      </label>
      {children}
      {help && <p className="m-0 text-[13px] text-ink-3">{help}</p>}
    </div>
  );
}

// "বাজেট ও বিস্তারিত": the budget plus whatever the chosen kind needs (floors, batches, land, shop).
export function KindDetails({ values, set }: KindDetailsProps) {
  const t = useTranslations("NewProject");
  const optional = t("optional");
  const { kind } = values;
  const seasons = values.farmType === "CROP";

  return (
    <FormSection id="np-budget-title" title={t("budgetTitle")} className="gap-4.5">
      {kind === "FARM" && (
        <div role="radiogroup" aria-labelledby="np-farm-title" className="flex flex-col gap-2">
          <span id="np-farm-title" className="text-[15px] font-semibold">
            {t("farmTypeTitle")}
          </span>
          <div className="flex flex-wrap gap-2">
            {FARM_TYPES.map((type) => {
              const on = type === values.farmType;
              return (
                <label
                  key={type}
                  className={cn(
                    "box-border flex h-11 cursor-pointer items-center gap-2 rounded-full pr-4 pl-3 text-[15px]",
                    on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
                  )}
                >
                  <input type="radio" name="np-farm" checked={on} onChange={() => set({ farmType: type })} className="m-0 size-4 accent-brand" />
                  {t(`farmTypes.${type}`)}
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
        <BudgetField value={values.budget} onChange={(budget) => set({ budget })} />

        {kind === "BUILDING" && (
          <Field id="np-floors" label={t("floors")} optional={optional} help={t("floorsHelp")}>
            <Stepper
              id="np-floors"
              value={values.floors}
              max={30}
              onChange={(floors) => set({ floors })}
              lessLabel={t("floorsLess")}
              moreLabel={t("floorsMore")}
            />
          </Field>
        )}

        {kind === "FARM" && (
          <Field id="np-batches" label={t(seasons ? "seasons" : "batches")} optional={optional} help={t(seasons ? "seasonsHelp" : "batchesHelp")}>
            <Stepper
              id="np-batches"
              value={values.batches}
              max={20}
              onChange={(batches) => set({ batches })}
              lessLabel={t("countLess")}
              moreLabel={t("countMore")}
            />
          </Field>
        )}

        {kind === "LAND" && (
          <Field id="np-area" label={t("landArea")} optional={optional} help={t("landHelp", { unit: t(`landUnits.${values.landUnit}`) })}>
            <div className="flex items-center gap-2">
              <TextInput
                id="np-area"
                inputMode="decimal"
                placeholder={t("landAreaPlaceholder")}
                value={values.landArea}
                onChange={(event) => set({ landArea: event.target.value })}
                className="w-27.5 font-semibold"
              />
              <div role="group" aria-label={t("landUnitLabel")} className="flex gap-0.5 rounded-lg bg-canvas-deep p-1">
                {LAND_UNITS.map((unit) => {
                  const on = unit === values.landUnit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ landUnit: unit })}
                      className={cn(
                        "h-9.5 cursor-pointer rounded-md border-none px-3 text-sm",
                        on ? "bg-white font-semibold text-ink shadow-tab" : "bg-transparent font-medium text-ink-2",
                      )}
                    >
                      {t(`landUnits.${unit}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          </Field>
        )}

        {kind === "BUSINESS" && (
          <Field id="np-business" label={t("businessType")} optional={optional}>
            <TextInput
              id="np-business"
              placeholder={t("businessPlaceholder")}
              value={values.businessType}
              onChange={(event) => set({ businessType: event.target.value })}
            />
          </Field>
        )}

        {(kind === "RENOVATION" || kind === "OTHER") && (
          <p className="m-0 flex items-start gap-2.5 rounded-lg bg-surface-2 px-3.5 py-3 text-sm leading-[1.55] text-ink-2 sm:mt-7.5">
            <Icon name="info" size={18} strokeWidth={2} className="text-brand" />
            {t(kind === "RENOVATION" ? "renovationNote" : "otherNote")}
          </p>
        )}
      </div>

      {kind === "LAND" && (
        <Field id="np-plots" label={t("plots")} optional={optional} help={t("plotsHelp")}>
          <Stepper id="np-plots" value={values.plots} max={50} onChange={(plots) => set({ plots })} lessLabel={t("plotsLess")} moreLabel={t("plotsMore")} />
        </Field>
      )}
    </FormSection>
  );
}
