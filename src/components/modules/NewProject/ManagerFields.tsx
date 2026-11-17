"use client";

import { useTranslations } from "next-intl";
import { FormSection } from "@/components/shared/form/FormSection";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { ManagerLoginFields, type ManagerLoginFieldsProps } from "./ManagerLoginFields";
import type { ManagerMode } from "./newProjectValues";

const MODES: ManagerMode[] = ["NOW", "LATER"];

// "প্রজেক্ট ম্যানেজার" (design v2, board NewProject): open the manager's login now, or run
// the project alone and add a manager later from the members page.
export function ManagerFields(props: ManagerLoginFieldsProps) {
  const t = useTranslations("NewProject.manager");
  const { values, set } = props;

  return (
    <FormSection id="np-mgr-title" title={t("title")} hint={t("hint")} className="gap-4">
      <div role="radiogroup" aria-labelledby="np-mgr-title" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODES.map((mode) => {
          const on = values.managerMode === mode;
          const key = mode === "NOW" ? "now" : "later";
          return (
            <label
              key={mode}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-[14px]",
                on ? "border-2 border-brand bg-brand-wash px-3.75 py-3.25" : "border border-line bg-white px-4 py-3.5",
              )}
            >
              <input
                type="radio"
                name="np-mgr-mode"
                checked={on}
                onChange={() => set({ managerMode: mode })}
                className="m-0 mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{t(key)}</span>
                <span className="text-[13px] leading-normal text-ink-2">{t(`${key}Body`)}</span>
              </span>
            </label>
          );
        })}
      </div>

      {values.managerMode === "NOW" ? (
        <ManagerLoginFields {...props} />
      ) : (
        <p className="m-0 flex items-start gap-2.5 rounded-lg bg-surface-2 px-3.5 py-3 text-sm leading-[1.55] text-ink-2">
          <Icon name="info" size={18} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{t.rich("laterNote", { strong: (chunks) => <strong className="text-ink">{chunks}</strong> })}</span>
        </p>
      )}
    </FormSection>
  );
}
