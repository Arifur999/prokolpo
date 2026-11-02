import { isAxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SaleDetailView } from "@/components/modules/Sales/detail/SaleDetailView";
import { dhakaToday } from "@/lib/dhakaTime";
import { getUserInfo } from "@/services/auth.services";
import { getAccounts } from "@/services/books.services";
import { getSale } from "@/services/sales.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Sales"))("title") };
}

const loadSale = async (projectId: string, saleId: string) => {
  try {
    return (await getSale(projectId, saleId)).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
};

// Board SaleDetail; ?collect=1 opens SaleCollect straight away.
export default async function SalePage({ params, searchParams }: PageProps<"/projects/[projectId]/sales/[saleId]">) {
  const [{ projectId, saleId }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(projectId);
  if (!project) notFound();
  const [detail, accounts, me] = await Promise.all([loadSale(projectId, saleId), getAccounts(projectId), getUserInfo()]);
  if (!detail) notFound();

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <SaleDetailView
        projectId={projectId}
        projectName={project.name}
        detail={detail}
        accounts={accounts.data}
        today={dhakaToday()}
        canWrite={project.role !== "VIEWER"}
        openCollect={query.collect === "1"}
        from={me ? `${me.firstName} ${me.lastName}` : ""}
      />
    </div>
  );
}
