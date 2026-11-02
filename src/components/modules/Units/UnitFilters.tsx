"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { STATUS_LOOK } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { UnitStatus, UnitType } from "@/types/sales.types";

export type UnitFilter = { status: UnitStatus | "ALL"; type: UnitType | "ALL"; q: string };

type UnitFiltersProps = {
  filter: UnitFilter;
  counts: Record<UnitStatus | "ALL", number>;
  types: UnitType[];
  matched: number;
  onChange: (next: UnitFilter) => void;
};

const STATUSES = ["ALL", "AVAILABLE", "BOOKED", "SOLD"] as const;

// Status chips with counts, type chips, and search (board Units).
export function UnitFilters({ filter, counts, types, matched, onChange }: UnitFiltersProps) {
  const t = useTranslations("Units");
  const filtering = filter.status !== "ALL" || filter.type !== "ALL" || !!filter.q;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div role="group" aria-label={t("statusLabel")} className="flex gap-1.5 rounded-xl border border-line-2 bg-white p-1">
        {STATUSES.map((status) => {
          const on = filter.status === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...filter, status })}
              className={cn(
                "flex h-8.5 cursor-pointer items-center gap-1.75 rounded-[9px] border-none px-3 text-sm",
                on ? "bg-brand font-semibold text-white" : "bg-transparent font-medium text-ink",
              )}
            >
              {status !== "ALL" && <span aria-hidden="true" className={cn("size-2.5 rounded-[3px]", STATUS_LOOK[status].swatch)} />}
              {t(`status.${status}`)}
              <span className="text-[13px] font-semibold opacity-80">{counts[status]}</span>
            </button>
          );
        })}
      </div>
      <div role="group" aria-label={t("typeLabel")} className="flex flex-wrap gap-1.5">
        {(["ALL", ...types] as const).map((type) => {
          const on = filter.type === type;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...filter, type })}
              className={cn(
                "h-9 cursor-pointer rounded-full bg-white px-3.5 text-sm text-ink",
                on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line font-medium",
              )}
            >
              {type === "ALL" ? t("allTypes") : t(`type.${type}`)}
            </button>
          );
        })}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        {filtering && (
          <>
            <span className="text-sm text-ink-2">{t("matched", { count: matched })}</span>
            <button
              type="button"
              onClick={() => onChange({ status: "ALL", type: "ALL", q: "" })}
              className="h-8.5 cursor-pointer rounded-lg border-none bg-transparent px-2.5 text-sm font-semibold text-brand underline"
            >
              {t("clear")}
            </button>
          </>
        )}
        <label className="relative flex items-center">
          <span className="sr-only">{t("search")}</span>
          <Icon name="search" size={18} strokeWidth={2} className="pointer-events-none absolute left-3 text-ink-3" />
          <input
            type="search"
            placeholder={t("search")}
            value={filter.q}
            onChange={(event) => onChange({ ...filter, q: event.target.value })}
            className="h-10.5 w-62.5 rounded-[10px] border border-line bg-white pr-3 pl-9.5 text-[15px] text-ink outline-none"
          />
        </label>
      </div>
    </div>
  );
}
