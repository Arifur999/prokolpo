"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";

type ProjectSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
  const t = useTranslations("Dashboard");

  return (
    <div className="relative w-full sm:w-80">
      <label htmlFor="db-search" className="sr-only">
        {t("searchLabel")}
      </label>
      <span className="pointer-events-none absolute top-3.25 left-3.5 flex text-ink-3">
        <Icon name="search" size={18} strokeWidth={2} />
      </span>
      <input
        id="db-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="box-border h-11 w-full rounded-lg border border-line bg-white pr-3.5 pl-10.5 text-[15px] text-ink outline-none placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
      />
    </div>
  );
}
