"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { addCategoryAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { cn } from "@/lib/utils";
import type { ISettingsCategory } from "@/types/settings.types";
import { CategoryRow, CATEGORY_GRID } from "./CategoryRow";
import { SettingsCard } from "./SettingsCard";
import { useSettingsSave } from "./useSettingsSave";

// "খরচের খাত" (board Settings, CATS): each head with its entries and spending; rename or set
// a budget in place, hide it from the expense form, delete it while unused, or add one.
export function CategoriesTab({ projectId, categories, canEdit }: { projectId: string; categories: ISettingsCategory[]; canEdit: boolean }) {
  const t = useTranslations("Settings.categories");
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const { run, isPending } = useSettingsSave();
  const hidden = categories.filter((c) => c.hidden).length;

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError(t("nameMissing"));
    if (categories.some((c) => c.name.trim().toLowerCase() === trimmed.toLowerCase())) return setError(t("taken"));
    run(
      () => addCategoryAction(projectId, { name: trimmed, budget: null, hidden: false }),
      t("added", { name: trimmed }),
      (result) => (result.success ? setName("") : setError(result.fieldErrors?.name ?? result.message)),
    );
  };

  return (
    <SettingsCard
      id="st-cats"
      title={t("title")}
      sub={t("sub")}
      className="overflow-hidden"
      aside={
        <span className="text-[13px] text-ink-2">
          {hidden ? t("countHidden", { count: categories.length, hidden }) : t("count", { count: categories.length })}
        </span>
      }
    >
      <div role="table" aria-labelledby="st-cats" className="overflow-x-auto">
        <div role="row" className={cn(CATEGORY_GRID, "h-9.5 border-b border-line-2 bg-surface-2 px-5.5 text-[13px] font-semibold text-ink-2")}>
          <span role="columnheader">{t("name")}</span>
          <span role="columnheader" className="hidden text-right md:block">
            {t("entries")}
          </span>
          <span role="columnheader" className="text-right">
            {t("spent")}
          </span>
          <span role="columnheader" className="hidden md:block">
            {t("budget")}
          </span>
          <span role="columnheader" className="text-right">
            {t("actions")}
          </span>
        </div>
        {categories.map((c) => (
          <CategoryRow key={`${c.id}-${c.name}-${c.budget}-${c.hidden}`} projectId={projectId} category={c} canEdit={canEdit} />
        ))}
      </div>
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2.5 px-5.5 py-3">
          <label htmlFor="st-cat-new" className="sr-only">
            {t("newLabel")}
          </label>
          <input
            id="st-cat-new"
            placeholder={t("newPlaceholder")}
            value={name}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className={cn(
              "box-border h-10 w-70 max-w-full rounded-lg bg-white px-3 text-[15px] text-ink outline-none focus:border-brand",
              error ? "border-[1.5px] border-danger-strong" : "border border-line",
            )}
          />
          <button
            type="button"
            onClick={add}
            disabled={isPending}
            className="h-10 cursor-pointer rounded-lg border border-brand bg-white px-3.5 text-sm font-semibold text-brand"
          >
            {t("add")}
          </button>
          {error && (
            <span role="alert" className="text-[13px] text-danger">
              {error}
            </span>
          )}
        </div>
      )}
    </SettingsCard>
  );
}
