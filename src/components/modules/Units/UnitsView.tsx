"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { Icon } from "@/components/shared/icon/Icon";
import { floorList, typesFor, unitStatus } from "@/lib/unitLook";
import type { IUnit, UnitStatus } from "@/types/sales.types";
import { FloorBoard } from "./FloorBoard";
import { UnitDialog, type UnitDialogMode } from "./UnitDialog";
import { UnitFilters, type UnitFilter } from "./UnitFilters";
import { UnitPanel } from "./UnitPanel";
import { UnitSummary } from "./UnitSummary";

type UnitsViewProps = { projectId: string; projectName: string; kind: string; floors: number | null; units: IUnit[]; canWrite: boolean };

const squash = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();

// The units page (boards Units, UnitsStart): what is free, booked or sold, floor by floor.
export function UnitsView({ projectId, projectName, kind, floors: floorCount, units, canWrite }: UnitsViewProps) {
  const t = useTranslations("Units");
  const [filter, setFilter] = useState<UnitFilter>({ status: "ALL", type: "ALL", q: "" });
  const [selected, setSelected] = useState("");
  const [dialog, setDialog] = useState<UnitDialogMode | null>(null);
  const types = typesFor(kind);
  const floors = floorList(floorCount, units);
  const q = squash(filter.q);
  const matches = (u: IUnit) =>
    (filter.status === "ALL" || unitStatus(u) === filter.status) &&
    (filter.type === "ALL" || u.type === filter.type) &&
    (!q || squash(u.name).includes(q) || (!!u.sale && (squash(u.sale.customer).includes(q) || u.sale.phone.includes(q))));
  const counts = units.reduce<Record<UnitStatus | "ALL", number>>((acc, u) => ({ ...acc, ALL: acc.ALL + 1, [unitStatus(u)]: acc[unitStatus(u)] + 1 }), {
    ALL: 0,
    AVAILABLE: 0,
    BOOKED: 0,
    SOLD: 0,
  });
  const picked = units.find((u) => u.id === selected);
  const button = "flex h-11 cursor-pointer items-center gap-2 rounded-[10px] text-[15px] font-semibold";

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          canWrite && (
            <>
              <button type="button" onClick={() => setDialog({ kind: "bulk" })} className={`${button} border border-line bg-white px-4 text-ink`}>
                <Icon name="grid" size={18} strokeWidth={2} />
                {t("bulk")}
              </button>
              <button
                type="button"
                onClick={() => setDialog({ kind: "one", floor: floors.at(-1) ?? 1 })}
                className={`${button} border-none bg-brand pr-4.5 pl-3.5 text-white`}
              >
                <Icon name="plus" size={18} strokeWidth={2.2} />
                {t("add")}
              </button>
            </>
          )
        }
      />
      <UnitSummary units={units} />
      {units.length > 0 ? (
        <>
          <UnitFilters
            filter={filter}
            counts={counts}
            types={types.filter((type) => type !== "OTHER" || units.some((u) => u.type === "OTHER"))}
            matched={units.filter(matches).length}
            onChange={setFilter}
          />
          <div className="grid grid-cols-1 items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <FloorBoard
              floors={floors}
              units={units}
              selected={selected}
              matches={matches}
              canWrite={canWrite}
              onPick={setSelected}
              onAddOnFloor={(floor) => setDialog({ kind: "one", floor })}
            />
            <UnitPanel projectId={projectId} unit={picked} canWrite={canWrite} onEdit={() => picked && setDialog({ kind: "edit", unit: picked })} />
          </div>
        </>
      ) : (
        <section aria-labelledby="em-title" className="flex flex-col items-center gap-3.5 rounded-2xl border border-line-2 bg-white px-6 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-[18px] bg-brand-tint text-brand">
            <Icon name="building" size={30} strokeWidth={1.8} />
          </span>
          <h2 id="em-title" className="m-0 text-xl font-semibold">
            {t("emptyTitle")}
          </h2>
          <p className="m-0 max-w-130 text-[15px] leading-[1.6] text-ink-2">{t("emptyBody")}</p>
          {canWrite && (
            <div className="mt-1.5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setDialog({ kind: "one", floor: floors.at(-1) ?? 1 })}
                className="h-11.5 cursor-pointer rounded-xl border border-line bg-white px-4.5 text-[15px] font-semibold text-ink"
              >
                {t("emptyOne")}
              </button>
              <button
                type="button"
                onClick={() => setDialog({ kind: "bulk" })}
                className="h-11.5 cursor-pointer rounded-xl border-none bg-brand px-5 text-[15px] font-semibold text-white"
              >
                {t("emptyBulk")}
              </button>
            </div>
          )}
        </section>
      )}
      {dialog && <UnitDialog projectId={projectId} mode={dialog} units={units} types={types} floors={floors} onClose={() => setDialog(null)} />}
    </>
  );
}
