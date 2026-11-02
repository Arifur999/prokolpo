"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { useTransition, type ReactNode } from "react";
import { logoutAction } from "@/app/_actions/authActions";
import { Icon } from "@/components/shared/icon/Icon";
import { useSwitchLanguage } from "@/hooks/useSwitchLanguage";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  name: string;
  company: string | null;
  initials: string;
  isStaff: boolean;
};

const itemClass =
  "flex h-10 cursor-pointer items-center rounded-lg px-2.5 text-[15px] text-ink no-underline outline-none hover:text-ink data-highlighted:bg-surface-2";

function MenuLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <DropdownMenu.Item asChild className={itemClass}>
      <Link href={href}>{children}</Link>
    </DropdownMenu.Item>
  );
}

const Separator = () => <DropdownMenu.Separator className="my-1 h-px bg-line-3" />;

// The avatar button at the top right and its account menu (boards Dashboard, DashboardStaff).
export function UserMenu({ name, company, initials, isStaff }: UserMenuProps) {
  const t = useTranslations("AppHeader");
  const common = useTranslations("Common");
  const { locale, target, switchLanguage } = useSwitchLanguage();
  const [, startTransition] = useTransition();
  const languages = { bn: "বাংলা", en: "English" };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="flex h-13 cursor-pointer items-center gap-2.5 rounded-xl border-none bg-transparent pr-2 pl-1.5 text-left text-ink">
        <span aria-hidden="true" className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-brand">
          {initials}
        </span>
        <span className="sr-only flex-col leading-[1.35] sm:not-sr-only sm:flex">
          <span className="text-[15px] font-semibold">{name}</span>
          {company && <span className="text-[13px] text-ink-3">{company}</span>}
        </span>
        <Icon name="chevronDown" size={18} strokeWidth={2} className="text-ink-3" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="z-50 flex w-57.5 flex-col rounded-xl border border-line-2 bg-white p-1.5 shadow-raised">
          {isStaff && (
            <>
              <DropdownMenu.Item
                asChild
                className="flex h-11 cursor-pointer items-center gap-2.5 rounded-lg bg-ink px-2.5 text-[15px] font-semibold text-white no-underline outline-none hover:text-white"
              >
                <Link href={ROUTES.admin}>
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-gold font-heading text-sm leading-none font-bold text-ink"
                  >
                    {common("logoMark")}
                  </span>
                  {t("adminPanel")}
                  <span className="ml-auto rounded-full bg-gold px-1.75 text-[11px] leading-[1.7] font-bold text-ink">{t("staffBadge")}</span>
                </Link>
              </DropdownMenu.Item>
              <Separator />
            </>
          )}
          <MenuLink href={ROUTES.dashboard}>{t("myProjects")}</MenuLink>
          <MenuLink href={ROUTES.profile}>{t("profile")}</MenuLink>
          <DropdownMenu.Group aria-label={t("language")} className="flex h-11 items-center justify-between gap-2 pr-1 pl-2.5">
            <span className="flex items-center gap-2 text-[15px] text-ink">
              <Icon name="language" size={16} className="text-ink-3" />
              {t("language")}
            </span>
            <span className="flex rounded-full bg-surface-4 p-0.75">
              {(["bn", "en"] as const).map((code) =>
                code === locale ? (
                  <span
                    key={code}
                    aria-current="true"
                    lang={code}
                    className="flex h-7.5 items-center rounded-full bg-white px-3 text-sm font-bold text-brand shadow-segment"
                  >
                    {languages[code]}
                  </span>
                ) : (
                  <DropdownMenu.Item
                    key={code}
                    lang={target}
                    onSelect={switchLanguage}
                    className="flex h-7.5 cursor-pointer items-center rounded-full px-3 text-sm font-semibold text-ink-2 outline-none data-highlighted:text-ink"
                  >
                    {languages[code]}
                  </DropdownMenu.Item>
                ),
              )}
            </span>
          </DropdownMenu.Group>
          <MenuLink href={ROUTES.support}>{t("help")}</MenuLink>
          <Separator />
          <DropdownMenu.Item onSelect={() => startTransition(() => logoutAction())} className={cn(itemClass, "text-danger")}>
            {t("logout")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
