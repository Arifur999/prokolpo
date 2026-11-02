"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { NavGroup } from "@/lib/projectNav";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ProjectNavLinksProps = {
  projectId: string;
  groups: NavGroup[];
  onNavigate?: () => void;
};

// The project's pages, grouped as the sidebar shows them; the current page is highlighted.
export function ProjectNavLinks({ projectId, groups, onNavigate }: ProjectNavLinksProps) {
  const t = useTranslations("Overview.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-0.5">
      {groups.map((group) => (
        <Fragment key={group.key}>
          {group.key !== "main" && <p className="m-0 px-3 pt-3.5 pb-1.5 text-[13px] font-semibold text-white/62">{t(`${group.key}Group`)}</p>}
          {group.items.map((item) => {
            const href = projectHref(projectId, item.page);
            const current = pathname === href;
            return (
              <Link
                key={item.key}
                href={href}
                onClick={onNavigate}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex h-10.5 items-center gap-3 rounded-lg px-3 text-[15px] no-underline",
                  current ? "bg-white/12 font-semibold text-white hover:text-white" : "font-medium text-white/80 hover:bg-white/6 hover:text-white",
                )}
              >
                <span className={cn("flex", current && "text-gold-light")}>
                  <Icon name={item.icon} size={18} />
                </span>
                {t(item.key)}
              </Link>
            );
          })}
        </Fragment>
      ))}
    </nav>
  );
}
