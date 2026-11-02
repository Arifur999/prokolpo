import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Icon } from "@/components/shared/icon/Icon";
import { initials } from "@/lib/initials";
import { projectNav } from "@/lib/projectNav";
import { ROUTES } from "@/lib/routes";
import type { IUser } from "@/types/auth.types";
import type { IProject } from "@/types/project.types";
import { LogoutButton } from "./LogoutButton";
import { ProjectNavLinks } from "./ProjectNavLinks";

// The green column inside a project (board Main): brand, the project switcher, its pages,
// and the signed-in person at the bottom. Phones get MobileProjectNav instead.
export async function ProjectSidebar({ project, user }: { project: IProject; user: IUser }) {
  const t = await getTranslations("Overview.nav");
  const common = await getTranslations("Common");
  const tp = await getTranslations("Projects");

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-5 overflow-y-auto bg-brand px-4 py-6 text-white lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold font-heading text-[22px] leading-none font-bold text-brand"
        >
          {common("logoMark")}
        </span>
        <span className="flex flex-col">
          <span className="font-heading text-[21px] leading-[1.3] font-bold">{common("appName")}</span>
          <span className="text-[13px] text-white/68">{common("appTagline")}</span>
        </span>
      </div>

      <Link
        href={ROUTES.dashboard}
        aria-label={`${t("switchProject")} — ${project.name}`}
        className="box-border flex w-full items-center gap-2.5 rounded-xl border border-white/14 bg-white/6 p-3 text-left text-white no-underline hover:text-white"
      >
        <span className="flex min-w-0 grow flex-col">
          <span className="text-[13px] text-white/68">{t("currentProject")}</span>
          <span className="truncate text-[15px] font-semibold">{project.name}</span>
        </span>
        <span className="rounded-full bg-gold/20 px-2 py-px text-[13px] font-semibold text-gold-light">{tp(`ownership.${project.ownership}`)}</span>
        <Icon name="chevronsUpDown" size={16} strokeWidth={2} className="text-white/70" />
      </Link>

      <ProjectNavLinks projectId={project.id} groups={projectNav(project)} />

      <div className="mt-auto flex flex-col gap-2.5">
        <Link
          href={ROUTES.profile}
          aria-label={t("profileLabel", { name: user.name })}
          className="flex items-center gap-3 rounded-[14px] bg-white/6 p-3 text-white no-underline hover:text-white"
        >
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-[15px] font-bold text-brand">
            {initials(user.firstName, user.lastName)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-semibold">{user.name}</span>
            <span className="text-[13px] text-white/68">{tp(`role.${project.role}`)}</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <LogoutButton label={t("logout")} />
          <LanguageToggle
            label={t("switchLanguage")}
            className="box-border flex h-11 items-center justify-center gap-1.5 rounded-lg border border-white/18 bg-transparent px-3 text-[15px] font-semibold text-white"
            iconSize={16}
          />
        </div>
      </div>
    </aside>
  );
}
