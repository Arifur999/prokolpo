import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShopView } from "@/components/modules/Shop/ShopView";
import { dhakaToday } from "@/lib/dhakaTime";
import { getAccounts } from "@/services/books.services";
import { getShopBook } from "@/services/shop.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Shop"))("title") };
}

// Board BizSales, with BizDayNew as its dialog.
export default async function BizSalesPage({ params }: PageProps<"/projects/[projectId]/biz-sales">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project || project.kind !== "BUSINESS") notFound();
  const [book, accounts] = await Promise.all([getShopBook(projectId), getAccounts(projectId)]);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ShopView
        projectId={projectId}
        projectName={project.name}
        businessType={project.businessType}
        book={book.data}
        accounts={accounts.data}
        today={dhakaToday()}
        canWrite={project.role !== "VIEWER"}
      />
    </div>
  );
}
