import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { projectHref } from "@/lib/routes";

type ExpenseBreadcrumbProps = {
  projectId: string;
  current: string;
  title: string;
  sub?: ReactNode;
  aside?: ReactNode;
};

// "খরচ › নতুন খরচ" over the page title (boards ExpenseNew, ExpenseEdit).
export function ExpenseBreadcrumb({ projectId, current, title, sub, aside }: ExpenseBreadcrumbProps) {
  const t = useTranslations("ExpenseForm");

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2.5">
        <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "expenses")} className="text-ink-2 no-underline hover:text-ink">
            {t("breadcrumb")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {current}
          </span>
        </nav>
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{title}</h1>
          {sub && <p className="m-0 text-sm text-ink-3">{sub}</p>}
        </div>
      </div>
      {aside}
    </div>
  );
}
