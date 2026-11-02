import { notFound, redirect } from "next/navigation";
import { MobileProjectNav } from "@/components/modules/Project/MobileProjectNav";
import { ProjectSidebar } from "@/components/modules/Project/ProjectSidebar";
import { SESSION_EXPIRED_LOGIN_ROUTE } from "@/lib/authUtils";
import { projectNav } from "@/lib/projectNav";
import { getUserInfo } from "@/services/auth.services";
import { loadProject } from "./loadProject";

// Every page inside a project: the green sidebar on desktop, the bottom bar on phones.
export default async function ProjectLayout({ children, params }: LayoutProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const [user, project] = await Promise.all([getUserInfo(), loadProject(projectId)]);
  if (!user) redirect(SESSION_EXPIRED_LOGIN_ROUTE);
  if (!project) notFound();

  const groups = projectNav(project);
  const salesGroup = groups.find((group) => group.key === "joint" || group.key === "sales");
  const salesPage = salesGroup?.items.find((item) => item.key !== "partners")?.page ?? null;

  return (
    <div className="flex min-h-screen">
      <ProjectSidebar project={project} user={user} />
      <main id="main-content" tabIndex={-1} className="flex min-w-0 grow flex-col pb-24 outline-none lg:pb-0">
        {children}
      </main>
      <MobileProjectNav projectId={project.id} groups={groups} salesPage={salesPage} />
    </div>
  );
}
