import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UnitsView } from "@/components/modules/Units/UnitsView";
import { getUnits } from "@/services/sales.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Units"))("title") };
}

// Boards Units and UnitsStart.
export default async function UnitsPage({ params }: PageProps<"/projects/[projectId]/units">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const units = await getUnits(projectId);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <UnitsView
        projectId={projectId}
        projectName={project.name}
        kind={project.kind}
        floors={project.floors}
        units={units.data}
        canWrite={project.role !== "VIEWER"}
      />
    </div>
  );
}
