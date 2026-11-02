import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PartnersView } from "@/components/modules/Partners/PartnersView";
import { dhakaToday } from "@/lib/dhakaTime";
import { getAccounts } from "@/services/books.services";
import { getPartnerBoard } from "@/services/partners.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Partners"))("title") };
}

// Boards PartnerList, PartnerCapitalCall and PartnerNew. Only joint projects have partners.
export default async function PartnersPage({ params }: PageProps<"/projects/[projectId]/partners">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project || project.ownership !== "PARTNERSHIP") notFound();

  const [board, accounts] = await Promise.all([getPartnerBoard(projectId), getAccounts(projectId)]);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <PartnersView
        projectId={projectId}
        projectName={project.name}
        board={board.data}
        accounts={accounts.data}
        today={dhakaToday()}
        isOwner={project.role === "OWNER"}
        canWrite={project.role !== "VIEWER"}
      />
    </div>
  );
}
