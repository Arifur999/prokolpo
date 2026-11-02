import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AccountsView } from "@/components/modules/Accounts/AccountsView";
import { dhakaToday } from "@/lib/dhakaTime";
import { getAccountLedger, getAccounts } from "@/services/books.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Accounts"))("title") };
}

// Boards Accounts and AccountsTransfer.
export default async function AccountsPage({ params }: PageProps<"/projects/[projectId]/accounts">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();

  const [accounts, ledger] = await Promise.all([getAccounts(projectId), getAccountLedger(projectId)]);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <AccountsView
        projectId={projectId}
        projectName={project.name}
        accounts={accounts.data}
        movements={ledger.data}
        today={dhakaToday()}
        canWrite={project.role !== "VIEWER"}
      />
    </div>
  );
}
