import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/modules/Project/LogoutButton";
import { Icon } from "@/components/shared/icon/Icon";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { initials } from "@/lib/initials";
import type { IUser } from "@/types/auth.types";
import { AdminNavLinks } from "./AdminNavLinks";

type AdminSidebarProps = { user: IUser; openSupport: number };

// The panel's dark column (board AdminDashboard): logo with its badge, the pages, the way back
// to the app and the staff member at the bottom. Phones get the bar at the top instead.
export async function AdminSidebar({ user, openSupport }: AdminSidebarProps) {
  const t = await getTranslations("Admin");
  const common = await getTranslations("Common");
  const security = await getTranslations("AdminSecurity");
  const brand = (
    <div className="flex items-center gap-3 px-2">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold font-heading text-[22px] leading-none font-bold text-ink"
      >
        {common("logoMark")}
      </span>
      <span className="flex flex-col items-start gap-0.5">
        <span className="font-heading text-[21px] leading-[1.3] font-bold">{common("appName")}</span>
        <span className="rounded-full bg-gold px-2 text-xs leading-[1.6] font-bold text-ink">{security("badge")}</span>
      </span>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-3 bg-ink px-4 pt-4 pb-2 text-white lg:hidden print:hidden">
        {brand}
        <AdminNavLinks openSupport={openSupport} row />
      </div>
      <aside
        aria-label={t("panel")}
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-5.5 overflow-y-auto bg-ink px-4 py-6 text-white lg:flex print:hidden"
      >
        {brand}
        <AdminNavLinks openSupport={openSupport} />
        <div className="mt-auto flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="flex h-11 items-center gap-2.5 rounded-[10px] bg-white/6 px-3 text-[15px] font-medium text-white no-underline hover:text-white"
          >
            <Icon name="arrowLeft" size={18} strokeWidth={2} />
            {t("backToApp")}
          </Link>
          <div className="flex items-center gap-3 rounded-[14px] bg-white/6 p-3">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-[15px] font-bold text-ink">
              {initials(user.firstName, user.lastName)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[15px] font-semibold">{user.name}</span>
              {user.staffRole && <span className="text-[13px] text-gold-light">{security(`roles.${user.staffRole}`)}</span>}
            </span>
          </div>
          <div className="flex gap-2">
            <LogoutButton label={t("logout")} />
            <LanguageToggle
              label={t("language")}
              className="box-border flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-white/18 bg-transparent px-3 text-[15px] font-semibold text-white"
              iconSize={16}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
