import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type ReportKind = "EXPENSE" | "COLLECTION" | "PROFIT" | "DUES";

type ReportNavProps = { kinds: ReportKind[]; current: ReportKind; href: (kind: ReportKind) => string };

// The list of reports down the left (board Reports).
export function ReportNav({ kinds, current, href }: ReportNavProps) {
  const t = useTranslations("Reports");
  return (
    <nav aria-label={t("navLabel")} className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white print:hidden">
      {kinds.map((k) => {
        const on = k === current;
        return (
          <Link
            key={k}
            href={href(k)}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex items-start gap-2.5 border-b border-line-3 py-3.5 pr-3.5 pl-3 text-ink no-underline last:border-b-0 hover:text-ink",
              on ? "bg-brand-wash shadow-[inset_3px_0_0_var(--color-brand)]" : "bg-white",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[15px] font-bold",
                on ? "bg-brand text-white" : "bg-surface-4 text-ink-2",
              )}
            >
              {t(`kinds.${k}.mark`)}
            </span>
            <span className="flex flex-col">
              <span className={cn("text-[15px]", on ? "font-bold" : "font-semibold")}>{t(`kinds.${k}.label`)}</span>
              <span className="text-xs leading-[1.45] text-ink-3">{t(`kinds.${k}.sub`)}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
