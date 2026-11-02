"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { savePhasesAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { budgetPercent, budgetTone, formatAmount, formatPercent, toLatinDigits } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ISettingsPhase } from "@/types/settings.types";
import { SaveBar } from "./SaveBar";
import { SettingsCard } from "./SettingsCard";
import { useSettingsSave } from "./useSettingsSave";

type Row = { key: string; id: string; name: string; budget: string };

const rowsOf = (phases: ISettingsPhase[]): Row[] => phases.map((p) => ({ key: p.id, id: p.id, name: p.name, budget: p.budget ? String(p.budget) : "" }));
const total = (rows: Row[]) => rows.reduce((sum, r) => sum + Number(r.budget || 0), 0);

const USE_TONE = { ok: "text-success", near: "text-gold-ink", over: "text-danger" } as const;
const GRID = "grid grid-cols-[40px_minmax(0,1fr)_120px_96px] items-center gap-x-2.5 md:grid-cols-[52px_minmax(0,1fr)_170px_130px_90px_120px]";

// "তলা ও ধাপ" (board SettingsPhases): rename, budget and reorder the phases, add new ones and
// delete those without entries, then save the whole list at once.
export function PhasesTab({ projectId, phases, canEdit }: { projectId: string; phases: ISettingsPhase[]; canEdit: boolean }) {
  const t = useTranslations("Settings.phases");
  const saved = rowsOf(phases);
  const [rows, setRows] = useState(saved);
  const [seq, setSeq] = useState(1);
  const { run, isPending } = useSettingsSave();
  const byId = new Map(phases.map((p) => [p.id, p]));

  const clean = JSON.stringify(rows) === JSON.stringify(saved);
  const names = rows.map((r) => r.name.trim().toLowerCase());
  const bad = names.some((n, i) => !n || names.indexOf(n) !== i);
  const update = (i: number, patch: Partial<Row>) => setRows((list) => list.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, by: number) =>
    setRows((list) => {
      const next = [...list];
      const [row] = next.splice(i, 1);
      if (row) next.splice(i + by, 0, row);
      return next;
    });
  const add = () => {
    setRows((list) => [...list, { key: `new-${seq}`, id: "", name: t("newName"), budget: "" }]);
    setSeq((n) => n + 1);
  };
  const save = () =>
    run(
      () =>
        savePhasesAction(
          projectId,
          rows.map((r) => ({ id: r.id, name: r.name.trim(), budget: r.budget ? Number(r.budget) : null })),
        ),
      t("saved"),
    );

  const note = clean ? t("cleanNote") : t("dirtyNote", { from: formatAmount(total(saved)), to: formatAmount(total(rows)) });
  return (
    <SettingsCard
      id="st-phases"
      title={t("title")}
      sub={t("sub")}
      aside={
        <span className="flex flex-col items-end">
          <span className="text-xs text-ink-3">{t("total")}</span>
          <strong className="text-xl font-bold">৳ {formatAmount(total(rows))}</strong>
        </span>
      }
      footer={
        canEdit && (
          <SaveBar clean={clean} problem={bad ? t("nameMissing") : undefined} note={note} pending={isPending} onReset={() => setRows(saved)} onSave={save} />
        )
      }
    >
      <div role="table" aria-labelledby="st-phases" className="overflow-x-auto">
        <div role="row" className={cn(GRID, "h-9.5 border-b border-line-2 bg-surface-2 px-5.5 text-[13px] font-semibold text-ink-2")}>
          <span role="columnheader">{t("no")}</span>
          <span role="columnheader">{t("name")}</span>
          <span role="columnheader">{t("budget")}</span>
          <span role="columnheader" className="hidden text-right md:block">
            {t("spent")}
          </span>
          <span role="columnheader" className="hidden text-right md:block">
            {t("use")}
          </span>
          <span role="columnheader" className="text-right">
            {t("actions")}
          </span>
        </div>
        {rows.map((r, i) => {
          const saved = byId.get(r.id);
          const spent = saved?.spent ?? 0;
          const percent = budgetPercent(spent, Number(r.budget) || null);
          const locked = saved?.locked ?? false;
          return (
            <div key={r.key} role="row" className={cn(GRID, "border-b border-line-3 px-5.5 py-1.5", !r.id && "bg-brand-wash")}>
              <span role="cell" className="text-sm text-ink-3">
                {i + 1}
              </span>
              <span role="cell">
                <input
                  aria-label={t("nameAria", { no: i + 1 })}
                  value={r.name}
                  maxLength={60}
                  disabled={!canEdit}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className={cn(
                    "box-border h-9.5 w-full rounded-lg bg-white px-2.5 text-[15px] font-semibold text-ink outline-none focus:border-brand disabled:bg-surface-4",
                    r.name.trim() ? "border border-line" : "border-[1.5px] border-danger-strong",
                  )}
                />
              </span>
              <span role="cell">
                <input
                  inputMode="numeric"
                  aria-label={t("budgetAria", { name: r.name })}
                  placeholder={t("noBudget")}
                  value={r.budget ? formatAmount(Number(r.budget)) : ""}
                  disabled={!canEdit}
                  onChange={(e) => update(i, { budget: toLatinDigits(e.target.value).slice(0, 13) })}
                  className="box-border h-9.5 w-full rounded-lg border border-line bg-white px-2.5 text-[15px] text-ink outline-none focus:border-brand disabled:bg-surface-4"
                />
              </span>
              <span role="cell" className="hidden text-right text-sm text-ink-2 md:block">
                {spent ? `৳ ${formatAmount(spent)}` : "—"}
              </span>
              <span role="cell" className={cn("hidden text-right text-sm font-bold md:block", percent === null ? "text-ink-5" : USE_TONE[budgetTone(percent)])}>
                {percent === null ? "—" : formatPercent(percent)}
              </span>
              <span role="cell" className="flex justify-end gap-0.5">
                {canEdit && (
                  <>
                    <IconButton icon="chevronUp" label={t("up", { name: r.name })} disabled={i === 0} onClick={() => move(i, -1)} />
                    <IconButton icon="chevronDown" label={t("down", { name: r.name })} disabled={i === rows.length - 1} onClick={() => move(i, 1)} />
                    <IconButton
                      icon="trash"
                      danger
                      label={t("delete", { name: r.name })}
                      title={locked ? t("locked") : undefined}
                      disabled={locked}
                      onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))}
                    />
                  </>
                )}
              </span>
            </div>
          );
        })}
        {canEdit && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5.5 py-2.5">
            <button
              type="button"
              onClick={add}
              className="flex h-9.5 cursor-pointer items-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-line bg-transparent px-3.5 text-sm font-semibold text-brand"
            >
              <Icon name="plus" size={16} strokeWidth={2.2} />
              {t("add")}
            </button>
            <span className="text-xs text-ink-3">{t("lockedNote")}</span>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

function IconButton({
  icon,
  label,
  title,
  disabled,
  danger,
  onClick,
}: {
  icon: "chevronUp" | "chevronDown" | "trash";
  label: string;
  title?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border-none bg-transparent hover:bg-surface-4",
        disabled ? "cursor-not-allowed text-line" : danger ? "cursor-pointer text-danger" : "cursor-pointer text-ink-2",
      )}
    >
      <Icon name={icon} size={18} strokeWidth={2} />
    </button>
  );
}
