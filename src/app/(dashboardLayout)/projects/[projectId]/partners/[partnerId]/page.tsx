import { isAxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PartnerDetailView } from "@/components/modules/Partners/PartnerDetailView";
import { getAccounts } from "@/services/books.services";
import { getUserInfo } from "@/services/auth.services";
import { getPartner } from "@/services/partners.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Partners"))("title") };
}

const loadPartner = async (projectId: string, partnerId: string) => {
  try {
    return (await getPartner(projectId, partnerId)).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};

// Board PartnerDetail.
export default async function PartnerPage({ params }: PageProps<"/projects/[projectId]/partners/[partnerId]">) {
  const { projectId, partnerId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const [detail, accounts, me] = await Promise.all([loadPartner(projectId, partnerId), getAccounts(projectId), getUserInfo()]);
  if (!detail) notFound();

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <PartnerDetailView
        projectId={projectId}
        projectName={project.name}
        detail={detail}
        accounts={accounts.data}
        canWrite={project.role !== "VIEWER"}
        from={me ? `${me.firstName} ${me.lastName}` : ""}
      />
    </div>
  );
}
