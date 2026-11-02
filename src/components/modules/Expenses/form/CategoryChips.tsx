"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCategoryAction } from "@/app/(dashboardLayout)/projects/[projectId]/expenses/_action";
import { FormSection } from "@/components/shared/form/FormSection";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import type { ICategory } from "@/types/books.types";

type CategoryChipsProps = {
  projectId: string;
  categories: ICategory[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
};

// "খাত *": one pill per expense head, and a way to add a head without leaving the form.
export function CategoryChips({ projectId, categories: initial, value, onChange, error }: CategoryChipsProps) {
  const t = useTranslations("ExpenseForm");
  const [categories, setCategories] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const add = () =>
    startTransition(async () => {
      const result = await createCategoryAction(projectId, name);
      if (!result.success) return void toast.error(result.fieldErrors?.name ?? result.message);
      setCategories((list) => [...list, result.data]);
      onChange(result.data.id);
      setAdding(false);
      setName("");
      toast.success(t("categoryAdded", { name: result.data.name }));
    });

  return (
    <FormSection
      id="ex-cat-title"
      inset="md"
      className="gap-3"
      title={
        <>
          {t("category")} <span className="text-danger">{t("required")}</span>
        </>
      }
    >
      <div role="radiogroup" aria-labelledby="ex-cat-title" aria-invalid={Boolean(error)} className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const on = category.id === value;
          return (
            <label
              key={category.id}
              className={cn(
                "relative box-border flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm has-focus-visible:shadow-focus",
                on ? "border-[1.5px] border-brand bg-brand-wash font-semibold text-brand" : "border border-line bg-white font-medium text-ink",
              )}
            >
              <input type="radio" name="ex-cat" checked={on} onChange={() => onChange(category.id)} className="absolute m-0 size-px opacity-0" />
              {on && <Icon name="check" size={15} strokeWidth={2.6} />}
              {category.name}
            </label>
          );
        })}
        {adding ? (
          <span className="flex items-center gap-1.5">
            <label htmlFor="ex-new-cat" className="sr-only">
              {t("newCategoryLabel")}
            </label>
            <input
              id="ex-new-cat"
              autoFocus
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (name.trim()) add();
                }
                if (event.key === "Escape") setAdding(false);
              }}
              className="box-border h-10 w-40 rounded-full border border-brand bg-white px-3.5 text-sm text-ink outline-none focus:shadow-focus"
            />
            <button
              type="button"
              disabled={!name.trim() || isPending}
              onClick={add}
              className="h-10 cursor-pointer rounded-full border-none bg-brand px-3.5 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-60"
            >
              {t("addCategory")}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-transparent px-3.5 text-sm font-medium text-ink-2"
          >
            <Icon name="plus" size={15} strokeWidth={2.2} />
            {t("newCategory")}
          </button>
        )}
      </div>
      {error && <p className="m-0 text-sm text-danger">{error}</p>}
    </FormSection>
  );
}
