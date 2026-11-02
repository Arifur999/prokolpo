"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addUnitsAction, deleteUnitAction, updateUnitAction } from "@/app/(dashboardLayout)/projects/[projectId]/units/_action";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Segmented } from "@/components/shared/Segmented";
import { Icon } from "@/components/shared/icon/Icon";
import { flatLetters } from "@/lib/unitLook";
import type { IUnit, UnitType } from "@/types/sales.types";
import { BulkFields, bulkPlan, type BulkDraft } from "./BulkFields";
import { UnitFields, type UnitDraft } from "./UnitFields";

export type UnitDialogMode = { kind: "one"; floor: number } | { kind: "bulk" } | { kind: "edit"; unit: IUnit };

type UnitDialogProps = { projectId: string; mode: UnitDialogMode; units: IUnit[]; types: UnitType[]; floors: number[]; onClose: () => void };

const BULK_ROWS = [
  { size: "1050", price: "6200000" },
  { size: "950", price: "5500000" },
  { size: "850", price: "4900000" },
  { size: "800", price: "4600000" },
  { size: "750", price: "4300000" },
  { size: "700", price: "4000000" },
];

// Add one unit, a block of flats, or edit a unit (board Units).
export function UnitDialog({ projectId, mode, units, types, floors, onClose }: UnitDialogProps) {
  const t = useTranslations("Units.dialog");
  const locale = useLocale() as "bn" | "en";
  const router = useRouter();
  const editing = mode.kind === "edit" ? mode.unit : null;
  const [tab, setTab] = useState<"one" | "bulk">(mode.kind === "bulk" ? "bulk" : "one");
  const [draft, setDraft] = useState<UnitDraft>(
    editing
      ? { type: editing.type, name: editing.name, floor: editing.floor, size: editing.size ? String(editing.size) : "", price: String(editing.price) }
      : { type: types[0] ?? "FLAT", name: "", floor: mode.kind === "one" ? mode.floor : (floors[0] ?? 1), size: "", price: "" },
  );
  const [bulk, setBulk] = useState<BulkDraft>({ floors: floors.filter((f) => f > 1), perFloor: 3, rows: BULK_ROWS });
  const [submitted, setSubmitted] = useState(false);
  const [nameError, setNameError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const taken = new Set(units.filter((u) => u.id !== editing?.id).map((u) => u.name.toLowerCase()));
  const plan = bulkPlan(locale, bulk, taken);
  const fresh = plan.filter((p) => !p.exists);
  const missingPrice = flatLetters(locale, bulk.perFloor).find((_, i) => !Number(bulk.rows[i]?.price || 0));
  const bulkError = !submitted
    ? undefined
    : !bulk.floors.length
      ? t("noFloors")
      : missingPrice
        ? t("rowPriceError", { letter: missingPrice })
        : !fresh.length
          ? t("allExist")
          : undefined;

  const done = (message: string) => {
    toast.success(message);
    onClose();
    router.refresh();
  };

  const save = () => {
    setSubmitted(true);
    if (tab === "bulk" && !editing) {
      if (!bulk.floors.length || missingPrice || !fresh.length) return;
      return startTransition(async () => {
        const result = await addUnitsAction(
          projectId,
          fresh.map((p) => ({ name: p.name, type: "FLAT", floor: p.floor, size: p.size, price: p.price })),
        );
        if (!result.success) return void toast.error(result.message);
        done(t("addedMany", { count: result.data.added }));
      });
    }
    const name = draft.name.trim();
    if (!name || !Number(draft.price || 0)) return;
    if (taken.has(name.toLowerCase())) return;
    const unit = { name, type: draft.type, floor: draft.floor, size: Number(draft.size || 0), price: Number(draft.price) };
    startTransition(async () => {
      const result = editing ? await updateUnitAction(projectId, editing.id, unit) : await addUnitsAction(projectId, [unit]);
      if (!result.success) {
        setNameError(result.message);
        return void toast.error(result.message);
      }
      done(editing ? t("saved", { name }) : t("added", { name }));
    });
  };

  const remove = () =>
    editing &&
    startTransition(async () => {
      const result = await deleteUnitAction(projectId, editing.id);
      if (!result.success) return void toast.error(result.message);
      done(t("deleted", { name: editing.name }));
    });

  const isBulk = tab === "bulk" && !editing;
  const dupName = taken.has(draft.name.trim().toLowerCase()) ? t("nameTaken") : nameError;

  return (
    <FormDialog
      title={editing ? t("editTitle", { name: editing.name }) : isBulk ? t("bulkTitle") : t("addTitle")}
      subtitle={editing ? t("editSub") : isBulk ? t("bulkSub") : t("addSub")}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass={isBulk ? "max-w-205" : "max-w-160"}
      topClass="top-12"
      band={
        !editing && (
          <div className="px-6 pt-1">
            <Segmented
              label={t("tabsLabel")}
              value={tab}
              onChange={setTab}
              className="grid grid-cols-2"
              options={[
                { value: "one", label: t("tabOne") },
                { value: "bulk", label: t("tabBulk") },
              ]}
            />
          </div>
        )
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div>
            {editing && !editing.sale && (
              <button
                type="button"
                onClick={remove}
                className="flex h-10.5 cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-transparent px-3 text-sm font-semibold text-danger"
              >
                <Icon name="trash" size={16} strokeWidth={2} />
                {t("delete")}
              </button>
            )}
            {editing?.sale && <span className="text-[13px] text-ink-3">{t("cantDelete")}</span>}
          </div>
          <DialogButtons
            cancel={t("cancel")}
            submit={editing ? t("saveEdit") : isBulk ? t("saveBulk", { count: fresh.length }) : t("saveOne")}
            onCancel={onClose}
            onSubmit={save}
            pending={isPending}
            disabled={isBulk && !fresh.length}
          />
        </div>
      }
    >
      {editing?.sale && (
        <p className="m-0 rounded-[10px] border border-gold-line bg-gold-wash px-3 py-2.5 text-sm leading-[1.55] text-gold-deep">
          {t("soldNote", { customer: editing.sale.customer })}
        </p>
      )}
      {isBulk ? (
        <BulkFields draft={bulk} floors={floors.slice().reverse()} plan={plan} error={bulkError} submitted={submitted} onChange={setBulk} />
      ) : (
        <UnitFields draft={draft} types={types} floors={floors.slice().reverse()} submitted={submitted} nameError={dupName} onChange={setDraft} />
      )}
    </FormDialog>
  );
}
