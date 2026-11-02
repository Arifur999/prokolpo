import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExpenseFilters } from "@/components/modules/Expenses/ExpenseFilters";
import { ExpenseTable } from "@/components/modules/Expenses/ExpenseTable";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { Icon } from "@/components/shared/icon/Icon";
import { StatCard } from "@/components/shared/StatCard";
import { formatAmount } from "@/lib/money";
import { isPeriod, periodRange } from "@/lib/periods";
import { projectHref } from "@/lib/routes";
import { getAccounts, getCategories, getContractors, getExpenses, getOverview, getSuppliers } from "@/services/books.services";
import { loadProject } from "../loadProject";

const PAGE_SIZE = 10;
const FILTER_KEYS = ["category", "phase", "party", "paid", "q"] as const;

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Expenses"))("title") };
}

// Boards ExpenseList, ExpenseListEn and ExpenseDelete.
export default async function ExpensesPage({ params, searchParams }: PageProps<"/projects/[projectId]/expenses">) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(projectId);
  if (!project) notFound();

  const t = await getTranslations("Expenses");
  const pick = (key: string) => (typeof query[key] === "string" ? (query[key] as string) : "");
  const period = isPeriod(pick("period")) ? pick("period") : "month";
  const page = Math.max(1, Number(pick("page")) || 1);
  const range = period === "all" ? null : periodRange(period as "month" | "last");
  const apiParams: Record<string, string> = { page: String(page), limit: String(PAGE_SIZE) };
  if (range) Object.assign(apiParams, { from: range.from, to: range.to });
  for (const key of FILTER_KEYS) if (pick(key)) apiParams[key] = pick(key);

  const [expenses, categories, suppliers, contractors, accounts, overview] = await Promise.all([
    getExpenses(projectId, apiParams),
    getCategories(projectId),
    getSuppliers(projectId),
    getContractors(projectId),
    getAccounts(projectId),
    getOverview(projectId),
  ]);
  const { items, summary } = expenses.data;
  const filtered = FILTER_KEYS.some((key) => pick(key));
  const parties = [...suppliers.data, ...contractors.data];

  return (
    <div className="flex grow flex-col gap-6 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ProjectPageHeader
        projectName={project.name}
        title={t("title")}
        actions={
          <>
            <button
              type="button"
              className="hidden h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink sm:flex"
            >
              <Icon name="download" size={18} />
              {t("excel")}
            </button>
            <button
              type="button"
              className="hidden h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink sm:flex"
            >
              <Icon name="printer" size={18} />
              {t("print")}
            </button>
            {project.role !== "VIEWER" && (
              <Link
                href={projectHref(projectId, "expenses/new")}
                className="box-border flex h-11 items-center gap-2 rounded-lg bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white no-underline hover:text-white"
              >
                <Icon name="plus" size={18} strokeWidth={2.2} />
                {t("add")}
              </Link>
            )}
          </>
        }
      />

      <section aria-label={t("summaryLabel")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <StatCard
          title={t("total")}
          value={`৳ ${formatAmount(summary.total)}`}
          note={range ? `${t("totalNote", { count: summary.count })} · ${range.label}` : t("totalNote", { count: summary.count })}
        />
        <StatCard title={t("credit")} dot="gold" value={`৳ ${formatAmount(summary.credit)}`} note={t("creditNote")} />
        <StatCard title={t("cash")} dot="green" value={`৳ ${formatAmount(summary.cash)}`} note={t("cashNote")} />
        <StatCard
          title={t("top")}
          value={summary.topCategory ?? t("none")}
          note={
            summary.topCategory
              ? t("topNote", { amount: formatAmount(summary.topAmount), percent: Math.round((summary.topAmount / summary.total) * 100) })
              : undefined
          }
        />
      </section>

      <section aria-label={t("table.listLabel")} className="flex grow flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <ExpenseFilters
          periods={[
            { value: "month", label: t("filters.thisMonth", { range: periodRange("month").label }) },
            { value: "last", label: t("filters.lastMonth", { range: periodRange("last").label }) },
            { value: "all", label: t("filters.allTime") },
          ]}
          categories={categories.data.map((c) => ({ value: c.id, label: c.name }))}
          phases={project.phases.map((p) => ({ value: p.id, label: p.name }))}
          parties={parties.map((p) => ({ value: p.id, label: p.name }))}
        />
        <ExpenseTable
          projectId={projectId}
          rows={items}
          filtered={filtered}
          page={page}
          pageSize={PAGE_SIZE}
          total={summary.count}
          canWrite={project.role !== "VIEWER"}
          totals={{
            partyDue: Object.fromEntries(parties.map((p) => [p.id, p.due])),
            categoryTotal: Object.fromEntries(overview.data.categories.filter((c) => !c.labour).map((c) => [c.name, c.amount])),
            phaseSpent: Object.fromEntries(project.phases.map((p) => [p.id, p.spent])),
            accountBalance: Object.fromEntries(accounts.data.map((a) => [a.name, a.balance])),
            projectSpent: project.spent,
          }}
        />
      </section>
    </div>
  );
}
