"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ADMIN_NAV, isCurrent } from "@/lib/adminNav";
import { cn } from "@/lib/utils";

type AdminNavLinksProps = { openSupport: number; row?: boolean };

// The panel's pages; the current one is lit, support shows what is waiting. On phones the
// same links run in a row across the top.
export function AdminNavLinks({ openSupport, row }: AdminNavLinksProps) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  return (
    <nav aria-label={t("menu")} className={cn("flex gap-0.5", row ? "overflow-x-auto pb-1" : "flex-col")}>
      {ADMIN_NAV.map((item) => {
        const on = isCurrent(item.href, pathname);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-10.5 shrink-0 items-center gap-3 rounded-[10px] px-3 text-[15px] whitespace-nowrap no-underline",
              on ? "bg-white/12 font-semibold text-white hover:text-white" : "font-medium text-white/80 hover:text-white",
            )}
          >
            <span className={cn("flex", on && "text-gold-light")}>
              <Icon name={item.icon} size={20} />
            </span>
            {t(`nav.${item.key}`)}
            {item.key === "support" && openSupport > 0 && (
              <span className="ml-auto box-border flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-gold px-1.75 text-xs font-bold text-ink">
                {openSupport}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
