"use client";

import { useTranslations } from "next-intl";
import { PARTNER_COLORS, percentText } from "@/lib/partnerMath";
import { cn } from "@/lib/utils";
import type { IPartner } from "@/types/partners.types";
import { ShareSwatch } from "./PartnerAvatar";

export type ShareMode = "PROP" | "MANUAL";

type ShareChangeTableProps = {
  partners: IPartner[];
  next: Record<string, number>;
  mode: ShareMode;
  manual: Record<string, string>;
  onManual: (id: string, value: string) => void;
  newcomer: string;
  newShare: number;
  totalTenths: number;
};

const ROW = "grid grid-cols-[minmax(0,1fr)_70px_104px_70px] items-center gap-x-2.5 px-3.5";

// Everyone's share now and after the newcomer joins (board PartnerNew); in "নিজে ঠিক করব"
// the owner types each one.
export function ShareChangeTable({ partners, next, mode, manual, onManual, newcomer, newShare, totalTenths }: ShareChangeTableProps) {
  const t = useTranslations("Partners.new");
  const tp = useTranslations("Partners");
  const ok = totalTenths === 1000;
  const off = (totalTenths - 1000) / 10;
  const diff = (d: number) => (Math.abs(d) < 0.05 ? "—" : `${d > 0 ? "+" : "−"}${percentText(Math.abs(d))}`);

  return (
    <div role="table" aria-label={t("tableLabel")} className="flex flex-col overflow-hidden rounded-xl border border-line-2">
      <div role="row" className={`${ROW} h-9 border-b border-line-2 bg-surface-2 text-xs font-semibold text-ink-2`}>
        <span role="columnheader">{tp("colPartner")}</span>
        <span role="columnheader" className="text-right">
          {t("colNow")}
        </span>
        <span role="columnheader" className="text-right">
          {t("colNext")}
        </span>
        <span role="columnheader" className="text-right">
          {t("colDiff")}
        </span>
      </div>
      {partners.map((p) => {
        const value = next[p.id] ?? p.share;
        const d = value - p.share;
        return (
          <div key={p.id} role="row" className={`${ROW} min-h-10 border-b border-line-3 bg-white py-1 text-sm`}>
            <span role="cell" className="flex min-w-0 items-center gap-2">
              <ShareSwatch color={p.color} />
              <span className="truncate font-medium">{p.name}</span>
            </span>
            <span role="cell" className="text-right text-ink-3">
              {percentText(p.share)}
            </span>
            <span role="cell" className="flex justify-end">
              {mode === "MANUAL" ? (
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label={t("inputLabel", { name: p.name })}
                  value={manual[p.id] ?? String(p.share)}
                  onChange={(event) => onManual(p.id, event.target.value)}
                  className="h-8 w-18 rounded-lg border border-line bg-white px-2 text-right text-sm text-ink outline-none"
                />
              ) : (
                <span className="font-bold">{percentText(value)}</span>
              )}
            </span>
            <span role="cell" className={cn("text-right text-[13px] font-semibold", d < -0.04 ? "text-danger" : d > 0.04 ? "text-success" : "text-ink-4")}>
              {diff(d)}
            </span>
          </div>
        );
      })}
      <div role="row" className={`${ROW} min-h-10 border-b border-line-3 bg-brand-wash py-1 text-sm`}>
        <span role="cell" className="flex min-w-0 items-center gap-2">
          <ShareSwatch color={PARTNER_COLORS.length - 1} />
          <span className="truncate font-bold">{newcomer || t("newcomer")}</span>
        </span>
        <span role="cell" className="text-right text-ink-3">
          —
        </span>
        <span role="cell" className="text-right font-bold">
          {newShare ? percentText(newShare) : "—"}
        </span>
        <span role="cell" className="text-right text-[13px] font-semibold text-success">
          {newShare ? `+${percentText(newShare)}` : "—"}
        </span>
      </div>
      <div role="row" className={cn(ROW, "h-10 text-sm font-bold", ok ? "bg-brand-wash" : "bg-danger-wash")}>
        <span role="cell">{t("total")}</span>
        <span role="cell" className="text-right text-ink-3">
          100%
        </span>
        <span role="cell" className={cn("text-right", ok ? "text-success" : "text-danger")}>
          {percentText(totalTenths / 10)}
        </span>
        <span role="cell" className={cn("text-right text-[13px]", ok ? "text-success" : "text-danger")}>
          {ok ? "✓" : `${off > 0 ? "+" : "−"}${percentText(Math.abs(off))}`}
        </span>
      </div>
    </div>
  );
}
