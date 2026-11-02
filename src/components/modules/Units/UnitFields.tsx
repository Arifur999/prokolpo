"use client";

import { useLocale, useTranslations } from "next-intl";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { TextInput } from "@/components/shared/form/TextInput";
import { useAmountWords } from "@/hooks/useAmountWords";
import { toLatinDigits } from "@/lib/money";
import { floorShort } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { UnitType } from "@/types/sales.types";

export type UnitDraft = { type: UnitType; name: string; floor: number; size: string; price: string };

type UnitFieldsProps = { draft: UnitDraft; types: UnitType[]; floors: number[]; submitted: boolean; nameError?: string; onChange: (next: UnitDraft) => void };

const chip = (on: boolean) => (on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium");

// One unit's type, name, floor, size and list price (board Units, "নতুন ইউনিট").
export function UnitFields({ draft, types, floors, submitted, nameError, onChange }: UnitFieldsProps) {
  const t = useTranslations("Units.dialog");
  const tu = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";
  const words = useAmountWords();
  const set = (patch: Partial<UnitDraft>) => onChange({ ...draft, ...patch });
  const nameBad = submitted && (!draft.name.trim() || !!nameError);
  const priceBad = submitted && !Number(draft.price || 0);

  return (
    <>
      <div role="radiogroup" aria-labelledby="ut-title" className="flex flex-col gap-2">
        <span id="ut-title" className="text-[15px] font-semibold">
          {t("kind")}
        </span>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={draft.type === type}
              onClick={() => set({ type })}
              className={cn("h-10 cursor-pointer rounded-full px-4 text-sm text-ink", chip(draft.type === type))}
            >
              {tu(`type.${type}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="u-name" className="text-[15px] font-semibold">
            {t("name")} <span className="text-danger">*</span>
          </label>
          <TextInput
            id="u-name"
            maxLength={40}
            placeholder={t(`namePh.${draft.type}`)}
            value={draft.name}
            onChange={(event) => set({ name: event.target.value })}
            invalid={nameBad}
            aria-describedby="u-name-err"
          />
          <span id="u-name-err" className="min-h-5 text-[13px] text-danger">
            {nameBad ? (nameError ?? t("nameError")) : ""}
          </span>
        </div>
        <div role="radiogroup" aria-labelledby="uf-title" className="flex flex-col gap-2">
          <span id="uf-title" className="text-[15px] font-semibold">
            {t("floor")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {floors.map((floor) => (
              <button
                key={floor}
                type="button"
                role="radio"
                aria-checked={draft.floor === floor}
                onClick={() => set({ floor })}
                className={cn("h-10 min-w-12 cursor-pointer rounded-[10px] px-2.5 text-sm text-ink", chip(draft.floor === floor))}
              >
                {floorShort(locale, floor)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="u-size" className="text-[15px] font-semibold">
            {t("size")} <span className="font-normal text-ink-3">{t("optional")}</span>
          </label>
          <div className="flex h-12 items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 focus-within:border-brand">
            <input
              id="u-size"
              inputMode="numeric"
              placeholder={t("sizePh")}
              value={draft.size}
              onChange={(event) => set({ size: toLatinDigits(event.target.value).slice(0, 6) })}
              className="h-full min-w-0 grow border-none bg-transparent p-0 text-base text-ink outline-none"
            />
            <span className="text-sm text-ink-3">sqft</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="u-price" className="text-[15px] font-semibold">
            {t("price")} <span className="text-danger">*</span>
          </label>
          <MoneyInput
            id="u-price"
            placeholder="0"
            value={draft.price}
            onChange={(price) => set({ price })}
            invalid={priceBad}
            aria-describedby="u-price-help"
          />
          <span id="u-price-help" className={cn("min-h-5 text-[13px] font-semibold", priceBad ? "text-danger" : "text-success")}>
            {priceBad ? t("priceError") : words(Number(draft.price || 0))}
          </span>
        </div>
      </div>
    </>
  );
}
