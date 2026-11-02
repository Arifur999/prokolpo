"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { UserFilterKind } from "@/types/admin.types";

const KINDS: UserFilterKind[] = ["ALL", "NEW", "NOEMAIL", "SUSPENDED", "STAFF"];

type UsersToolbarProps = { filter: UserFilterKind; query: string; counts: Record<UserFilterKind, number> };

// The chips and search above the users list (board AdminUsers); both live in the address.
export function UsersToolbar({ filter, query, counts }: UsersToolbarProps) {
  const t = useTranslations("AdminUsers");
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(query);
  const go = (next: { filter?: UserFilterKind; q?: string }) => {
    const params = new URLSearchParams();
    const f = next.filter ?? filter;
    const text = next.q ?? q;
    if (f !== "ALL") params.set("filter", f);
    if (text.trim()) params.set("q", text.trim());
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  // Search as people type, after a short pause.
  useEffect(() => {
    if (q.trim() === query) return;
    const timer = setTimeout(() => go({ q }), 350);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-2 px-5 py-3.5">
      <div role="radiogroup" aria-label={t("filterLabel")} className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => {
          const on = k === filter;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => go({ filter: k })}
              className={cn(
                "flex h-9.5 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-sm text-ink",
                on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
              )}
            >
              {t(`filters.${k}`)}
              <span className={cn("rounded-full px-1.75 text-xs font-bold", on ? "bg-brand text-white" : "bg-surface-4 text-ink-2")}>
                {formatAmount(counts[k])}
              </span>
            </button>
          );
        })}
      </div>
      <label className="relative w-full shrink-0 sm:w-80">
        <span className="sr-only">{t("search")}</span>
        <Icon name="search" size={18} strokeWidth={2} className="pointer-events-none absolute top-3.25 left-3.5 text-ink-3" />
        <input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="box-border h-11 w-full rounded-[10px] border border-line bg-white pr-3.5 pl-10 text-[15px] text-ink outline-none focus:border-brand focus:shadow-focus"
        />
      </label>
    </div>
  );
}
