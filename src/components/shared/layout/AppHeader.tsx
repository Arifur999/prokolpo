import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { initials } from "@/lib/initials";
import { ROUTES } from "@/lib/routes";
import type { IUser } from "@/types/auth.types";
import { HeaderLogo } from "./HeaderLogo";
import { UserMenu } from "./UserMenu";

// The white top bar of the signed-in pages outside a project (boards Dashboard, NewProject).
export async function AppHeader({ user }: { user: IUser }) {
  const t = await getTranslations("AppHeader");

  return (
    <header className="flex h-17 shrink-0 items-center justify-between border-b border-line-2 bg-white px-page">
      <HeaderLogo href={ROUTES.dashboard} label={t("homeLabel")} />
      <div className="flex items-center gap-3">
        <LanguageToggle
          label={t("switchLanguage")}
          className="hidden h-11 items-center gap-2 rounded-full border border-line bg-white pr-4 pl-3.5 text-[15px] font-semibold text-ink sm:flex"
          iconClassName="text-brand"
        />
        <UserMenu name={user.name} company={user.companyName} initials={initials(user.firstName, user.lastName)} isStaff={user.role === "staff"} />
      </div>
    </header>
  );
}
