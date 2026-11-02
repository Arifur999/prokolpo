import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CustomersView } from "@/components/modules/Customers/CustomersView";
import { getCustomers } from "@/services/sales.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Customers"))("title") };
}

// Boards CustomerList and CustomerAdd.
export default async function CustomersPage({ params }: PageProps<"/projects/[projectId]/customers">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const customers = await getCustomers(projectId);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <CustomersView projectId={projectId} projectName={project.name} customers={customers.data} canWrite={project.role !== "VIEWER"} />
    </div>
  );
}
