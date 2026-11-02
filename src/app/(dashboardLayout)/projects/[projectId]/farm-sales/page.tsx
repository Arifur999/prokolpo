import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProduceView } from "@/components/modules/Produce/ProduceView";
import { dhakaToday } from "@/lib/dhakaTime";
import { getAccounts } from "@/services/books.services";
import { getProduceBook } from "@/services/produce.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Produce"))("title") };
}

// Board FarmSales, with FarmSaleNew as its dialog.
export default async function FarmSalesPage({ params }: PageProps<"/projects/[projectId]/farm-sales">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project || project.kind !== "FARM" || !project.farmType) notFound();
  const [book, accounts] = await Promise.all([getProduceBook(projectId), getAccounts(projectId)]);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ProduceView
        projectId={projectId}
        projectName={project.name}
        farmType={project.farmType}
        book={book.data}
        accounts={accounts.data}
        today={dhakaToday()}
        canWrite={project.role !== "VIEWER"}
      />
    </div>
  );
}
