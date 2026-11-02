import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ExpenseGroup } from "@/components/modules/Reports/expense/buildExpenseLines";
import type { ReportKind } from "@/components/modules/Reports/ReportNav";
import { type ReportData, ReportsView } from "@/components/modules/Reports/ReportsView";
import { dhakaToday } from "@/lib/dhakaTime";
import { menusFor } from "@/lib/projectPlan";
import { monthBefore } from "@/lib/shopLook";
import { getAccounts, getContractors, getExpenseReport, getSuppliers } from "@/services/books.services";
import { getPartnerBoard } from "@/services/partners.services";
import { getSales, getUnits } from "@/services/sales.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Reports"))("title") };
}

const GROUPS: ExpenseGroup[] = ["CAT", "PHASE", "MONTH", "SUP"];
const lastDay = (month: string) => {
  const [y = 0, m = 1] = month.split("-").map(Number);
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
};

// Boards Reports, ReportCollection and ReportProfit. The report, grouping and period live in
// the address (?r=, ?g=, ?p=) so a printout or a shared link opens the same view.
export default async function ReportsPage({ params, searchParams }: PageProps<"/projects/[projectId]/reports">) {
  const { projectId } = await params;
  const query = await searchParams;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const menus = menusFor(project);
  const sells = menus.includes("sales");
  const joint = menus.includes("partners");
  const kinds: ReportKind[] = ["EXPENSE", ...(sells ? (["COLLECTION", "PROFIT"] as const) : []), "DUES"];
  const kind = kinds.find((k) => k === query.r) ?? "EXPENSE";
  const today = dhakaToday();

  let data: ReportData;
  if (kind === "COLLECTION") {
    data = { kind, sales: (await getSales(projectId)).data };
  } else if (kind === "PROFIT") {
    const [sales, units, board] = await Promise.all([getSales(projectId), getUnits(projectId), joint ? getPartnerBoard(projectId) : null]);
    data = {
      kind,
      sales: sales.data,
      units: units.data,
      partners: board?.data.partners ?? [],
      spent: project.spent,
      budget: project.budget,
      startDate: project.startDate,
    };
  } else if (kind === "DUES") {
    const [sales, board, suppliers, contractors, accounts] = await Promise.all([
      sells ? getSales(projectId) : null,
      joint ? getPartnerBoard(projectId) : null,
      getSuppliers(projectId),
      getContractors(projectId),
      getAccounts(projectId),
    ]);
    data = {
      kind,
      sales: sales?.data ?? null,
      partners: board?.data.partners ?? null,
      suppliers: suppliers.data,
      contractors: contractors.data,
      accounts: accounts.data,
    };
  } else {
    const group = GROUPS.find((g) => g === query.g) ?? "CAT";
    const period = group !== "MONTH" && query.p === "LAST" ? "LAST" : "ALL";
    const lastMonth = monthBefore(today.slice(0, 7));
    const range = period === "LAST" ? { from: `${lastMonth}-01`, to: lastDay(lastMonth) } : {};
    data = { kind: "EXPENSE", report: (await getExpenseReport(projectId, range)).data, group, period, lastMonth };
  }

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10 print:p-0">
      <ReportsView projectName={project.name} kinds={kinds} data={data} today={today} />
    </div>
  );
}
