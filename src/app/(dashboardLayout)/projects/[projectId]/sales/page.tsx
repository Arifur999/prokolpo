import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SalesView } from "@/components/modules/Sales/SalesView";
import { dhakaToday } from "@/lib/dhakaTime";
import { getAccounts } from "@/services/books.services";
import { getSales } from "@/services/sales.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Sales"))("title") };
}

// Board SalesList, with SaleCollect as its dialog.
export default async function SalesPage({ params }: PageProps<"/projects/[projectId]/sales">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const [sales, accounts] = await Promise.all([getSales(projectId), getAccounts(projectId)]);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <SalesView
        projectId={projectId}
        projectName={project.name}
        sales={sales.data}
        accounts={accounts.data}
        today={dhakaToday()}
        canWrite={project.role !== "VIEWER"}
      />
    </div>
  );
}
