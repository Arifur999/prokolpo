"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { FilterSelect, type FilterOption } from "@/components/shared/FilterSelect";
import { Icon } from "@/components/shared/icon/Icon";
import { Segmented } from "@/components/shared/Segmented";

type ExpenseFiltersProps = {
  periods: FilterOption[];
  categories: FilterOption[];
  phases: FilterOption[];
  parties: FilterOption[];
};

const SEARCH_DELAY_MS = 350;

// The bar above the expense table. Every choice lives in the URL, so a filtered list can be
// shared and the back button undoes a filter; changing one goes back to page 1.
export function ExpenseFilters({ periods, categories, phases, parties }: ExpenseFiltersProps) {
  const t = useTranslations("Expenses.filters");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  // Typing searches once the person pauses.
  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => set("q", query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the text changes
  }, [query]);

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line-2 px-4 py-4 lg:px-5">
      <FilterSelect
        label={t("period")}
        value={params.get("period") ?? "month"}
        options={periods}
        onChange={(value) => set("period", value === "month" ? "" : value)}
        icon={<Icon name="calendar" size={16} strokeWidth={2} className="text-ink-3" />}
      />
      <FilterSelect
        label={t("category")}
        value={params.get("category") ?? ""}
        options={[{ value: "", label: t("allCategories") }, ...categories]}
        onChange={(v) => set("category", v)}
      />
      {phases.length > 0 && (
        <FilterSelect
          label={t("phase")}
          value={params.get("phase") ?? ""}
          options={[{ value: "", label: t("allPhases") }, ...phases]}
          onChange={(v) => set("phase", v)}
        />
      )}
      <FilterSelect
        label={t("party")}
        value={params.get("party") ?? ""}
        options={[{ value: "", label: t("allParties") }, ...parties]}
        onChange={(v) => set("party", v)}
      />
      <Segmented
        label={t("paidLabel")}
        value={params.get("paid") ?? ""}
        onChange={(value) => set("paid", value)}
        options={[
          { value: "", label: t("all") },
          { value: "credit", label: t("credit") },
          { value: "cash", label: t("cash") },
        ]}
      />
      <div className="relative w-full sm:ml-auto sm:w-60">
        <label htmlFor="ex-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <span className="pointer-events-none absolute top-2.75 left-3 flex text-ink-3">
          <Icon name="search" size={18} strokeWidth={2} />
        </span>
        <input
          id="ex-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="box-border h-10 w-full rounded-lg border border-line bg-white pr-3 pl-9.5 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
        />
      </div>
    </div>
  );
}
