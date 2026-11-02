"use client";

import { useTranslations } from "next-intl";
import { FormSection } from "@/components/shared/form/FormSection";
import { TextArea } from "@/components/shared/form/TextArea";
import type { ExpenseValues } from "./expenseValues";
import { MemoPicker } from "./MemoPicker";

type DetailsFieldsProps = {
  values: ExpenseValues;
  set: (patch: Partial<ExpenseValues>) => void;
  memo: File | null;
  onMemo: (file: File | null) => void;
  memoHref?: string | null;
};

// "বিবরণ ও মেমো": a free description and a photo of the paper memo.
export function DetailsFields({ values, set, memo, onMemo, memoHref }: DetailsFieldsProps) {
  const t = useTranslations("ExpenseForm");

  return (
    <FormSection id="ex-more-title" inset="md" title={t("moreTitle")} className="gap-4">
      <div className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ex-note" className="text-[15px] font-semibold">
            {t("description")} <span className="font-normal text-ink-3">{t("optional")}</span>
          </label>
          <TextArea
            id="ex-note"
            rows={4}
            maxLength={500}
            placeholder={t("descriptionPlaceholder")}
            value={values.description}
            onChange={(event) => set({ description: event.target.value })}
            className="min-h-28 grow resize-none px-3.5 py-3 text-base"
          />
        </div>
        <MemoPicker file={memo} onChange={onMemo} currentHref={memoHref} />
      </div>
    </FormSection>
  );
}
