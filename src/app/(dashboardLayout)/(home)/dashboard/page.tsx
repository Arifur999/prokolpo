import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardEmpty } from "@/components/modules/Dashboard/DashboardEmpty";
import { DashboardHeading } from "@/components/modules/Dashboard/DashboardHeading";
import { DeletedProjects } from "@/components/modules/Dashboard/DeletedProjects";
import { NoActiveProjects } from "@/components/modules/Dashboard/NoActiveProjects";
import { ProjectBrowser } from "@/components/modules/Dashboard/ProjectBrowser";
import { ToastOnMount } from "@/components/shared/ToastOnMount";
import { dayPart } from "@/lib/dhakaTime";
import { getUserInfo } from "@/services/auth.services";
import { getDeletedProjects, getProjects } from "@/services/project.services";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Dashboard"))("title") };
}

// Boards Dashboard, DashboardEmpty, DashboardRestore. The layout already checked the session.
export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const t = await getTranslations("Dashboard");
  const [user, projects, deleted, { welcome }] = await Promise.all([getUserInfo(), getProjects(), getDeletedProjects(), searchParams]);
  const name = user?.name ?? "";
  const greeting = projects.data.length ? t(`greeting.${dayPart(new Date())}`, { name }) : t("greeting.welcome", { name });

  const main = projects.data.length ? <ProjectBrowser projects={projects.data} /> : deleted.data.length ? <NoActiveProjects /> : <DashboardEmpty />;

  return (
    <div className="flex grow flex-col gap-7">
      {welcome !== undefined && <ToastOnMount message={t("welcomeToast")} />}
      <DashboardHeading greeting={greeting} />
      {deleted.data.length ? <DeletedProjects projects={deleted.data}>{main}</DeletedProjects> : main}
    </div>
  );
}
