"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { OWNERSHIPS, type Ownership } from "@/types/project.types";
import { FormSection } from "@/components/shared/form/FormSection";

type OwnershipPickerProps = { value: Ownership; onChange: (ownership: Ownership) => void };

// ব্যক্তিগত or যৌথ; fixed for the life of the project.
export function OwnershipPicker({ value, onChange }: OwnershipPickerProps) {
  const t = useTranslations("NewProject");
  const tp = useTranslations("Projects.ownership");

  return (
    <FormSection id="np-type-title" title={t("ownershipTitle")} hint={t("ownershipHint")}>
      <div role="radiogroup" aria-labelledby="np-type-title" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OWNERSHIPS.map((ownership) => {
          const on = ownership === value;
          return (
            <label
              key={ownership}
              className={cn(
                "flex cursor-pointer items-start gap-3.5 rounded-[14px]",
                on ? "border-2 border-brand bg-brand-wash p-4.25" : "border border-line bg-white p-4.5",
              )}
            >
              <input
                type="radio"
                name="np-type"
                value={ownership}
                checked={on}
                onChange={() => onChange(ownership)}
                className="m-0 mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-base font-semibold">
                  <Icon name={ownership === "PARTNERSHIP" ? "users" : "user"} size={18} />
                  {tp(ownership)}
                </span>
                <span className="text-sm leading-[1.55] text-ink-2">{t(ownership === "PARTNERSHIP" ? "jointBody" : "personalBody")}</span>
              </span>
            </label>
          );
        })}
      </div>
    </FormSection>
  );
}
