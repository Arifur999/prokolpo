import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MembersView } from "@/components/modules/Members/MembersView";
import { getTeam } from "@/services/members.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Members"))("title") };
}

// Boards Members, MembersInvite and MembersResetCode.
export default async function MembersPage({ params }: PageProps<"/projects/[projectId]/members">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();

  const team = await getTeam(projectId);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <MembersView projectId={projectId} projectName={project.name} team={team.data} isOwner={project.role === "OWNER"} />
    </div>
  );
}
