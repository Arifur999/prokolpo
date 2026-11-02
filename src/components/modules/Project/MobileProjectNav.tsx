"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import type { NavGroup } from "@/lib/projectNav";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ProjectNavLinks } from "./ProjectNavLinks";

type MobileProjectNavProps = {
  projectId: string;
  groups: NavGroup[];
  // Projects that sell get "বিক্রি" in the bar; the rest get their accounts.
  salesPage: string | null;
};

type Tab = { key: string; label: string; icon: IconName; page: string };

// Phones (board Mobile): four tabs and "আরও" at the bottom, and the gold add-expense button.
export function MobileProjectNav({ projectId, groups, salesPage }: MobileProjectNavProps) {
  const t = useTranslations("Overview.nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const tabs: Tab[] = [
    { key: "overview", label: t("overview"), icon: "dashboard", page: "" },
    { key: "expenses", label: t("expenses"), icon: "receipt", page: "expenses" },
    { key: "dues", label: t("dues"), icon: "handCoins", page: "suppliers" },
    salesPage
      ? { key: "sales", label: t("salesShort"), icon: "key", page: salesPage }
      : { key: "accounts", label: t("accounts"), icon: "wallet", page: "accounts" },
  ];

  return (
    <>
      <Link
        href={projectHref(projectId, "expenses/new")}
        aria-label={t("addExpense")}
        className="fixed right-4 bottom-22 z-30 flex size-14.5 items-center justify-center rounded-[18px] bg-gold text-brand shadow-fab lg:hidden"
      >
        <Icon name="plus" size={26} strokeWidth={2.4} />
      </Link>

      <nav
        aria-label={t("mobileLabel")}
        className="fixed inset-x-0 bottom-0 z-30 box-border flex h-18 border-t border-line-2 bg-white px-1 pt-1.5 pb-2 lg:hidden"
      >
        {tabs.map((tab) => {
          const href = projectHref(projectId, tab.page);
          const current = pathname === href;
          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[13px] no-underline",
                current ? "font-semibold text-brand" : "font-medium text-ink-3",
              )}
            >
              <span className={cn("flex h-7.5 w-14 items-center justify-center rounded-full", current && "bg-brand-tint")}>
                <Icon name={tab.icon} size={20} />
              </span>
              {tab.label}
            </Link>
          );
        })}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-none bg-transparent text-[13px] font-medium text-ink-3">
            <span className="flex h-7.5 w-14 items-center justify-center">
              <Icon name="menu" size={20} />
            </span>
            {t("more")}
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim lg:hidden" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-brand px-4 py-6 text-white lg:hidden">
              <div className="flex items-center justify-between px-2">
                <Dialog.Title className="m-0 text-base font-semibold">{t("label")}</Dialog.Title>
                <Dialog.Close
                  aria-label={t("close")}
                  className="flex size-10 cursor-pointer items-center justify-center rounded-lg border-none bg-white/10 text-white"
                >
                  <Icon name="plus" size={20} className="rotate-45" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">{t("label")}</Dialog.Description>
              <ProjectNavLinks projectId={projectId} groups={groups} onNavigate={() => setOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </>
  );
}
