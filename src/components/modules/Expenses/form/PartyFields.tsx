"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DateField } from "@/components/shared/form/DateField";
import { FormSection } from "@/components/shared/form/FormSection";
import { SelectField } from "@/components/shared/form/SelectField";
import { Icon } from "@/components/shared/icon/Icon";
import { Segmented } from "@/components/shared/Segmented";
import { projectHref } from "@/lib/routes";
import type { PartyKind } from "@/types/books.types";
import type { ExpenseValues } from "./expenseValues";

export type Party = { id: string; name: string; due: number };
export type PhaseOption = { id: string; name: string; budget: number | null; spent: number };

type PartyFieldsProps = {
  projectId: string;
  values: ExpenseValues;
  set: (patch: Partial<ExpenseValues>) => void;
  suppliers: Party[];
  contractors: Party[];
  phases: PhaseOption[];
  error?: string;
};

// "কার কাছ থেকে, কোন কাজে": supplier, contractor or nobody; the phase; the date.
export function PartyFields({ projectId, values, set, suppliers, contractors, phases, error }: PartyFieldsProps) {
  const t = useTranslations("ExpenseForm");
  const kinds: PartyKind[] = ["SUPPLIER", "CONTRACTOR", "NONE"];
  const list = values.partyKind === "SUPPLIER" ? suppliers : contractors;
  const field = values.partyKind === "SUPPLIER" ? "supplierId" : "contractorId";

  return (
    <FormSection id="ex-party-title" inset="md" title={t("partyTitle")} className="gap-4">
      <div className="grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Segmented
            label={t("partyKind")}
            value={values.partyKind}
            onChange={(partyKind) => set({ partyKind })}
            options={kinds.map((kind) => ({ value: kind, label: t(`kind${kind}`) }))}
            className="self-start"
          />
          {values.partyKind === "NONE" ? (
            <p className="m-0 rounded-lg bg-surface-2 px-3.5 py-3 text-sm text-ink-2">{t("noneNote")}</p>
          ) : (
            <>
              <label htmlFor="ex-party" className="sr-only">
                {t(`kind${values.partyKind}`)}
              </label>
              <SelectField id="ex-party" value={values[field]} invalid={Boolean(error)} onChange={(event) => set({ [field]: event.target.value })}>
                <option value="">{list.length ? t("choose") : t(values.partyKind === "SUPPLIER" ? "noSuppliers" : "noContractors")}</option>
                {list.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </SelectField>
              {error && <p className="m-0 text-sm text-danger">{error}</p>}
              <Link
                href={projectHref(projectId, values.partyKind === "SUPPLIER" ? "suppliers?new=1" : "contractors?new=1")}
                className="flex items-center gap-1 self-start text-sm font-semibold no-underline"
              >
                <Icon name="plus" size={14} strokeWidth={2.2} />
                {t(values.partyKind === "SUPPLIER" ? "newSupplier" : "newContractor")}
              </Link>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ex-phase" className="text-[15px] font-semibold">
              {t("phase")}
            </label>
            <SelectField id="ex-phase" value={values.phaseId} onChange={(event) => set({ phaseId: event.target.value })} className="pr-8 pl-3">
              <option value="">{t("noPhase")}</option>
              {phases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ex-date" className="text-[15px] font-semibold">
              {t("date")}
            </label>
            <DateField id="ex-date" value={values.date} onChange={(date) => set({ date })} />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
