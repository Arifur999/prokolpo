import { isAxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CustomerProfile } from "@/components/modules/Customers/CustomerProfile";
import { getCustomer } from "@/services/sales.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Customers"))("title") };
}

const loadCustomer = async (projectId: string, customerId: string) => {
  try {
    return (await getCustomer(projectId, customerId)).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};

// Board CustomerProfile.
export default async function CustomerPage({ params }: PageProps<"/projects/[projectId]/customers/[customerId]">) {
  const { projectId, customerId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const customer = await loadCustomer(projectId, customerId);
  if (!customer) notFound();

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <CustomerProfile projectId={projectId} customer={customer} canWrite={project.role !== "VIEWER"} />
    </div>
  );
}
