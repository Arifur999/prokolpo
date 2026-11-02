"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { deleteCategoryAction, updateCategoryAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount, toLatinDigits } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ISettingsCategory } from "@/types/settings.types";
import { useSettingsSave } from "./useSettingsSave";

export const CATEGORY_GRID = "grid grid-cols-[minmax(0,1fr)_110px_76px] items-center gap-x-2.5 md:grid-cols-[minmax(0,1fr)_120px_150px_150px_84px]";

// One head on the settings page. Name and budget save when the field is left; hide and
// delete act at once.
export function CategoryRow({ projectId, category: c, canEdit }: { projectId: string; category: ISettingsCategory; canEdit: boolean }) {
  const t = useTranslations("Settings.categories");
  const [name, setName] = useState(c.name);
  const [budget, setBudget] = useState(c.budget ? String(c.budget) : "");
  const { run, isPending } = useSettingsSave();
  const locked = c.entries > 0;

  const save = (patch: Partial<{ name: string; budget: number | null; hidden: boolean }>, done: string) =>
    run(() => updateCategoryAction(projectId, c.id, { name: c.name, budget: c.budget, hidden: c.hidden, ...patch }), done);
  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) return setName(c.name);
    if (trimmed !== c.name) save({ name: trimmed }, t("renamed", { name: trimmed }));
  };
  const commitBudget = () => {
    const value = budget ? Number(budget) : null;
    if (value !== c.budget) save({ budget: value }, t("budgetSaved", { name: c.name }));
  };

  return (
    <div role="row" className={cn(CATEGORY_GRID, "border-b border-line-3 px-5.5 py-1.25", c.hidden && "opacity-60")}>
      <span role="cell" className="flex min-w-0 items-center gap-2">
        <input
          aria-label={t("nameAria", { name: c.name })}
          value={name}
          maxLength={60}
          disabled={!canEdit || isPending}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          className="box-border h-9 w-full max-w-60 rounded-lg border border-line bg-white px-2.5 text-[15px] font-semibold text-ink outline-none focus:border-brand disabled:bg-surface-4"
        />
        {c.hidden && <span className="shrink-0 rounded-full bg-surface-4 px-2 text-xs font-bold text-ink-2">{t("hiddenTag")}</span>}
      </span>
      <span role="cell" className="hidden text-right text-sm text-ink-2 md:block">
        {c.entries ? t("entryCount", { count: c.entries }) : "—"}
      </span>
      <span role="cell" className="text-right text-sm font-semibold">
        {c.spent ? `৳ ${formatAmount(c.spent)}` : "—"}
      </span>
      <span role="cell" className="hidden md:block">
        <input
          inputMode="numeric"
          aria-label={t("budgetAria", { name: c.name })}
          placeholder="—"
          value={budget ? formatAmount(Number(budget)) : ""}
          disabled={!canEdit || isPending}
          onChange={(e) => setBudget(toLatinDigits(e.target.value).slice(0, 13))}
          onBlur={commitBudget}
          className="box-border h-9 w-full rounded-lg border border-line bg-white px-2.5 text-sm text-ink outline-none focus:border-brand disabled:bg-surface-4"
        />
      </span>
      <span role="cell" className="flex justify-end gap-0.5">
        {canEdit && (
          <>
            <button
              type="button"
              aria-label={c.hidden ? t("show", { name: c.name }) : t("hide", { name: c.name })}
              title={c.hidden ? t("show", { name: c.name }) : t("hide", { name: c.name })}
              disabled={isPending}
              onClick={() => save({ hidden: !c.hidden }, c.hidden ? t("shown", { name: c.name }) : t("hidden", { name: c.name }))}
              className="flex size-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-2 hover:bg-surface-4"
            >
              <Icon name={c.hidden ? "eye" : "eyeOff"} size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label={t("delete", { name: c.name })}
              title={locked ? t("locked", { count: c.entries }) : t("delete", { name: c.name })}
              disabled={locked || isPending}
              onClick={() => run(() => deleteCategoryAction(projectId, c.id), t("deleted", { name: c.name }))}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border-none bg-transparent hover:bg-surface-4",
                locked ? "cursor-not-allowed text-line" : "cursor-pointer text-danger",
              )}
            >
              <Icon name="trash" size={18} strokeWidth={2} />
            </button>
          </>
        )}
      </span>
    </div>
  );
}
