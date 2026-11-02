"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount, toLatinDigits } from "@/lib/money";
import { flatLetters, flatName, flatShort, floorShort } from "@/lib/unitLook";
import { cn } from "@/lib/utils";

export type BulkDraft = { floors: number[]; perFloor: number; rows: { size: string; price: string }[] };

export type PlannedFlat = { floor: number; index: number; name: string; short: string; exists: boolean; size: number; price: number };

// The flats a bulk add would make, top floor first; names already used are marked.
export const bulkPlan = (locale: "bn" | "en", draft: BulkDraft, taken: Set<string>): PlannedFlat[] =>
  [...draft.floors]
    .sort((a, b) => b - a)
    .flatMap((floor) =>
      Array.from({ length: draft.perFloor }, (_, index) => {
        const name = flatName(locale, floor, index);
        const row = draft.rows[index];
        return {
          floor,
          index,
          name,
          short: flatShort(locale, floor, index),
          exists: taken.has(name.toLowerCase()),
          size: Number(row?.size || 0),
          price: Number(row?.price || 0),
        };
      }),
    );

type BulkFieldsProps = { draft: BulkDraft; floors: number[]; plan: PlannedFlat[]; error?: string; submitted: boolean; onChange: (next: BulkDraft) => void };

// "একসাথে অনেক ফ্ল্যাট" (board Units): floors, flats per floor, each flat's size and price,
// and a preview of what will be made.
export function BulkFields({ draft, floors, plan, error, submitted, onChange }: BulkFieldsProps) {
  const t = useTranslations("Units.dialog");
  const tu = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";
  const letters = flatLetters(locale, draft.perFloor);
  const fresh = plan.filter((p) => !p.exists);
  const set = (patch: Partial<BulkDraft>) => onChange({ ...draft, ...patch });
  const setRow = (i: number, patch: Partial<BulkDraft["rows"][number]>) => set({ rows: draft.rows.map((r, k) => (k === i ? { ...r, ...patch } : r)) });
  const stepper = "size-10 cursor-pointer border-none bg-white text-xl text-ink disabled:cursor-not-allowed disabled:text-ink-disabled";

  return (
    <div className="grid grid-cols-1 gap-5.5 md:grid-cols-[minmax(0,1fr)_250px]">
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-col gap-2">
          <span id="bf-title" className="text-[15px] font-semibold">
            {t("floors")} <span className="font-normal text-ink-3">{t("floorsHint")}</span>
          </span>
          <div role="group" aria-labelledby="bf-title" className="flex flex-wrap gap-1.5">
            {floors.map((floor) => {
              const on = draft.floors.includes(floor);
              return (
                <button
                  key={floor}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ floors: on ? draft.floors.filter((f) => f !== floor) : [...draft.floors, floor] })}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-sm text-ink",
                    on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
                  )}
                >
                  {on && <Icon name="check" size={14} strokeWidth={2.4} />}
                  {tu("floor", { floor: floorShort(locale, floor) })}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span id="pf-title" className="text-[15px] font-semibold">
            {t("perFloor")}
          </span>
          <div role="group" aria-labelledby="pf-title" className="flex items-center overflow-hidden rounded-[10px] border border-line">
            <button
              type="button"
              aria-label={t("less")}
              disabled={draft.perFloor <= 1}
              onClick={() => set({ perFloor: draft.perFloor - 1 })}
              className={stepper}
            >
              −
            </button>
            <span aria-live="polite" className="min-w-11 text-center text-[17px] font-bold">
              {draft.perFloor}
            </span>
            <button
              type="button"
              aria-label={t("more")}
              disabled={draft.perFloor >= 6}
              onClick={() => set({ perFloor: draft.perFloor + 1 })}
              className={stepper}
            >
              +
            </button>
          </div>
          <span className="text-sm text-ink-3">{t("letters", { letters: letters.join(", ") })}</span>
        </div>
        <div role="table" aria-label={t("rowsLabel")} className="flex flex-col overflow-hidden rounded-xl border border-line-2">
          <div role="row" className="grid h-9 grid-cols-[92px_1fr_1.4fr] items-center gap-2.5 bg-surface-2 px-3 text-[13px] font-semibold text-ink-2">
            <span role="columnheader">{t("colFlat")}</span>
            <span role="columnheader">{t("colSize")}</span>
            <span role="columnheader">{t("colPrice")}</span>
          </div>
          {letters.map((letter, i) => {
            const row = draft.rows[i] ?? { size: "", price: "" };
            const bad = submitted && !Number(row.price || 0);
            const input = "h-10 w-full rounded-[9px] bg-white px-2.5 text-[15px] text-ink outline-none";
            return (
              <div key={letter} role="row" className="grid grid-cols-[92px_1fr_1.4fr] items-center gap-2.5 border-t border-line-3 px-3 py-1.75">
                <span role="cell" className="text-[15px] font-bold">
                  {t("rowFlat", { letter })}
                </span>
                <span role="cell">
                  <input
                    inputMode="numeric"
                    aria-label={t("rowSize", { letter })}
                    placeholder="sqft"
                    value={row.size}
                    onChange={(event) => setRow(i, { size: toLatinDigits(event.target.value).slice(0, 6) })}
                    className={cn(input, "border border-line")}
                  />
                </span>
                <span role="cell">
                  <input
                    inputMode="numeric"
                    aria-label={t("rowPrice", { letter })}
                    placeholder="0"
                    value={row.price ? formatAmount(Number(row.price)) : ""}
                    onChange={(event) => setRow(i, { price: toLatinDigits(event.target.value).slice(0, 11) })}
                    className={cn(input, "font-semibold", bad ? "border-[1.5px] border-danger-strong" : "border border-line")}
                  />
                </span>
              </div>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="m-0 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2.5 rounded-[14px] bg-surface-2 p-3.5">
        <span className="text-sm font-semibold">{t("previewTitle")}</span>
        <div aria-hidden="true" className="flex flex-col gap-1">
          {[...draft.floors]
            .sort((a, b) => b - a)
            .map((floor) => (
              <div key={floor} className="flex items-center gap-1.5">
                <span className="w-8.5 shrink-0 text-xs text-ink-3">{floorShort(locale, floor)}</span>
                <div className="flex grow gap-0.75">
                  {plan
                    .filter((p) => p.floor === floor)
                    .map((p) => (
                      <span
                        key={p.name}
                        title={p.exists ? t("previewExists", { name: p.name }) : p.name}
                        className={cn(
                          "flex h-6 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[5px] text-[11px] font-semibold whitespace-nowrap",
                          p.exists ? "border border-dashed border-[#C9C6BC] bg-surface-4 text-ink-4" : "border border-[#CBE3D5] bg-[#EEF6F1] text-success",
                        )}
                      >
                        {p.short}
                      </span>
                    ))}
                </div>
              </div>
            ))}
        </div>
        {draft.floors.length === 0 && <span className="text-[13px] text-ink-3">{t("previewNone")}</span>}
        <div className="flex flex-col gap-0.5 border-t border-line-2 pt-2">
          <strong className="text-lg font-bold text-brand">{t("previewCount", { count: fresh.length })}</strong>
          <span className="text-[13px] text-ink-2">{t("previewValue", { amount: formatAmount(fresh.reduce((n, p) => n + p.price, 0)) })}</span>
        </div>
        {plan.length > fresh.length && (
          <span className="text-[13px] leading-normal text-gold-ink">{t("previewDup", { count: plan.length - fresh.length })}</span>
        )}
        <span className="text-xs leading-normal text-ink-3">{t("previewNote")}</span>
      </div>
    </div>
  );
}
