"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { PROJECT_KINDS, type ProjectKind } from "@/types/project.types";
import { FormSection } from "./FormSection";

const KIND_ICON = { BUILDING: "building", FARM: "sprout", LAND: "map", BUSINESS: "store", RENOVATION: "paintRoller", OTHER: "package" } as const;

type KindPickerProps = { value: ProjectKind; onChange: (kind: ProjectKind) => void };

// "কিসের প্রজেক্ট?": six tiles; the choice decides heads, phases and menus.
export function KindPicker({ value, onChange }: KindPickerProps) {
  const t = useTranslations("NewProject");

  return (
    <FormSection id="np-kind-title" title={t("kindTitle")} hint={t("kindHint")}>
      <div role="radiogroup" aria-labelledby="np-kind-title" className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {PROJECT_KINDS.map((kind) => {
          const on = kind === value;
          return (
            <label
              key={kind}
              className={cn(
                "relative flex cursor-pointer flex-col gap-2.5 rounded-[14px]",
                on ? "border-2 border-brand bg-brand-wash p-3.75" : "border border-line bg-white p-4",
              )}
            >
              <input
                type="radio"
                name="np-kind"
                checked={on}
                onChange={() => onChange(kind)}
                className="absolute top-3.5 right-3.5 m-0 size-4.5 accent-brand"
              />
              <span className={cn("flex size-10 items-center justify-center rounded-xl text-brand", on ? "bg-brand-tint-2" : "bg-surface-4")}>
                <Icon name={KIND_ICON[kind]} size={22} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{t(`kinds.${kind}.label`)}</span>
                <span className="text-[13px] leading-normal text-ink-3">{t(`kinds.${kind}.hint`)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </FormSection>
  );
}
