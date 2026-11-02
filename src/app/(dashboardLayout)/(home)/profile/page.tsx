import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { DeleteCard } from "@/components/modules/Profile/DeleteCard";
import { DevicesCard } from "@/components/modules/Profile/DevicesCard";
import { InfoCard } from "@/components/modules/Profile/InfoCard";
import { LanguageCard } from "@/components/modules/Profile/LanguageCard";
import { PasswordCard } from "@/components/modules/Profile/PasswordCard";
import { ProjectsCard } from "@/components/modules/Profile/ProjectsCard";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES } from "@/lib/routes";
import { getDevices, getProfile } from "@/services/account.services";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Profile"))("title") };
}

// Board Profile: the account's details, password, devices, language, projects and deletion.
export default async function ProfilePage() {
  const t = await getTranslations("Profile");
  const [{ data: profile }, { data: devices }] = await Promise.all([getProfile(), getDevices()]);
  const now = new Date().toISOString();
  const owned = profile.projects.filter((p) => p.role === "OWNER").length;

  return (
    <div className="flex flex-col gap-5.5 pt-8">
      <div className="flex flex-col gap-2">
        <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={ROUTES.dashboard} className="text-ink-2 no-underline hover:text-ink">
            {t("breadcrumbHome")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {t("title")}
          </span>
        </nav>
        <h1 className="m-0 text-[30px] leading-[1.3] font-semibold">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <InfoCard key={profile.phone + profile.name + (profile.email ?? "") + (profile.companyName ?? "")} profile={profile} />
          <PasswordCard changedAt={profile.passwordChangedAt} />
          <DevicesCard devices={devices} now={now} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <LanguageCard now={now} />
          <ProjectsCard projects={profile.projects} />
          <DeleteCard owned={owned} isStaff={profile.staffRole !== null} />
        </div>
      </div>
    </div>
  );
}
