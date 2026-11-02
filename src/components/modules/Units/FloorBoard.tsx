"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { floorShort, STATUS_LOOK, unitStatus } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { IUnit } from "@/types/sales.types";

type FloorBoardProps = {
  floors: number[];
  units: IUnit[];
  selected: string;
  matches: (u: IUnit) => boolean;
  canWrite: boolean;
  onPick: (id: string) => void;
  onAddOnFloor: (floor: number) => void;
};

// "তলা অনুযায়ী ইউনিট" (board Units): one row per floor, top floor first, each unit a tile
// coloured by status; tiles outside the filter fade.
export function FloorBoard({ floors, units, selected, matches, canWrite, onPick, onAddOnFloor }: FloorBoardProps) {
  const t = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";

  return (
    <section aria-labelledby="bd-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-2 px-5 py-3.5">
        <h2 id="bd-title" className="m-0 text-[17px] font-semibold">
          {t("boardTitle")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("boardNote")}</span>
      </div>
      <div className="flex flex-col px-5 pt-1 pb-4.5">
        {floors.map((floor) => {
          const list = units.filter((u) => u.floor === floor).sort((a, b) => a.position - b.position);
          const free = list.filter((u) => !u.sale).length;
          const label = t("floor", { floor: floorShort(locale, floor) });
          return (
            <div
              key={floor}
              className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-dashed border-line-2 py-2.5 sm:grid-cols-[88px_minmax(0,1fr)]"
            >
              <div className="flex flex-col justify-center">
                <span className="text-[15px] font-bold">{label}</span>
                <span className="text-xs text-ink-3">
                  {!list.length ? t("floorEmpty") : free ? t("floorSub", { count: list.length, free }) : t("floorAllSold", { count: list.length })}
                </span>
              </div>
              {list.length > 0 ? (
                <div role="group" aria-label={label} className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-6">
                  {list.map((u) => (
                    <UnitTile key={u.id} unit={u} on={u.id === selected} faded={!matches(u)} onPick={() => onPick(u.id)} />
                  ))}
                </div>
              ) : (
                canWrite && (
                  <button
                    type="button"
                    onClick={() => onAddOnFloor(floor)}
                    className="flex min-h-16 cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-line bg-surface-3 text-sm font-semibold text-ink-2"
                  >
                    <Icon name="plus" size={16} strokeWidth={2.2} />
                    {t("floorAdd", { floor: floorShort(locale, floor) })}
                  </button>
                )
              )}
            </div>
          );
        })}
        <div aria-hidden="true" className="mt-2.5 h-1.5 rounded-[3px] bg-line" />
      </div>
    </section>
  );
}

function UnitTile({ unit: u, on, faded, onPick }: { unit: IUnit; on: boolean; faded: boolean; onPick: () => void }) {
  const t = useTranslations("Units");
  const status = unitStatus(u);
  const look = STATUS_LOOK[status];
  const narrow = u.type === "PARKING";
  const late = !!u.sale?.standing.late && !narrow;
  const label = t(`status.${status}`);
  const received = u.sale ? Math.min(100, (u.sale.standing.received / u.sale.price) * 100) : 0;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={u.sale ? t("tileBuyer", { name: u.name, status: label, customer: u.sale.customer }) : t("tileAria", { name: u.name, status: label })}
      onClick={onPick}
      className={cn(
        "relative flex min-h-22 min-w-0 cursor-pointer flex-col items-stretch gap-px overflow-hidden rounded-xl border py-2.25 pr-2.5 pl-3.5 text-left text-ink",
        narrow ? "col-span-1" : "col-span-2",
        look.tile,
        on && "border-brand shadow-[0_0_0_2px_var(--color-brand)]",
        faded && "opacity-30",
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", look.stripe)} />
      <span className="flex items-center justify-between gap-1.5">
        <span className="truncate text-[15px] font-bold">{u.name}</span>
        {late && <span className="shrink-0 rounded-full bg-danger-tint px-1.75 text-xs font-bold text-danger">{t("late")}</span>}
      </span>
      <span className="truncate text-xs text-ink-2">{narrow || !u.size ? `৳ ${formatAmount(u.price)}` : `${u.size} sqft · ৳ ${formatAmount(u.price)}`}</span>
      <span className={cn("mt-auto truncate text-[13px] font-semibold", look.ink)}>{u.sale && !narrow ? `${label} · ${u.sale.customer}` : label}</span>
      {status === "BOOKED" && !narrow && (
        <span aria-hidden="true" className="mt-0.75 block h-1 overflow-hidden rounded-full bg-[rgba(138,90,0,0.16)]">
          <span className="block h-full bg-gold-strong" style={{ width: `${received.toFixed(1)}%` }} />
        </span>
      )}
    </button>
  );
}
