"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

type ExpensePagerProps = { page: number; pageSize: number; total: number };

// The pages a list window can show at once around the current page.
const WINDOW = 5;

// "1–10, মোট 38টা  ‹ 1 2 3 4 ›": pages are links, so each page has its own URL.
export function ExpensePager({ page, pageSize, total }: ExpensePagerProps) {
  const t = useTranslations("Expenses");
  const pathname = usePathname();
  const params = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const href = (n: number) => {
    const next = new URLSearchParams(params);
    if (n > 1) next.set("page", String(n));
    else next.delete("page");
    return `${pathname}?${next.toString()}`;
  };
  const first = Math.max(1, Math.min(page - Math.floor(WINDOW / 2), pages - WINDOW + 1));
  const numbers = Array.from({ length: Math.min(WINDOW, pages) }, (_, i) => first + i);
  const box = "flex size-9 items-center justify-center rounded-lg border text-sm no-underline";

  const arrow = (n: number, label: string, icon: "chevronLeft" | "chevronRight", disabled: boolean) =>
    disabled ? (
      <span aria-label={label} aria-disabled="true" className={cn(box, "border-line-2 bg-white text-ink-disabled")}>
        <Icon name={icon} size={16} strokeWidth={2} />
      </span>
    ) : (
      <Link href={href(n)} aria-label={label} scroll={false} className={cn(box, "border-line-2 bg-white text-ink hover:text-ink")}>
        <Icon name={icon} size={16} strokeWidth={2} />
      </Link>
    );

  return (
    <nav aria-label={t("pager")} className="flex items-center gap-1.5 text-sm">
      <span className="mr-2 text-ink-3">{t("range", { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total })}</span>
      {arrow(page - 1, t("prev"), "chevronLeft", page <= 1)}
      {numbers.map((n) => (
        <Link
          key={n}
          href={href(n)}
          scroll={false}
          aria-current={n === page ? "page" : undefined}
          className={cn(box, n === page ? "border-brand bg-brand font-semibold text-white hover:text-white" : "border-line-2 bg-white text-ink hover:text-ink")}
        >
          {n}
        </Link>
      ))}
      {arrow(page + 1, t("next"), "chevronRight", page >= pages)}
    </nav>
  );
}
