import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExpenseBreadcrumb } from "@/components/modules/Expenses/ExpenseBreadcrumb";
import { EditExpenseForm } from "@/components/modules/Expenses/form/EditExpenseForm";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst, expenseLines } from "@/lib/expenseText";
import { formatDateTime } from "@/lib/dhakaTime";
import { projectHref } from "@/lib/routes";
import { getExpense } from "@/services/books.services";
import { loadExpenseFormData } from "../expenseFormData";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("ExpenseForm"))("editTitle") };
}

// Board ExpenseEdit.
export default async function EditExpensePage({ params }: PageProps<"/projects/[projectId]/expenses/[expenseId]">) {
  const { projectId, expenseId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  if (project.role === "VIEWER") redirect(projectHref(projectId, "expenses"));

  const expense = await getExpense(projectId, expenseId).then(
    (response) => response.data,
    () => null,
  );
  if (!expense) notFound();

  const [t, data] = await Promise.all([getTranslations("ExpenseForm"), loadExpenseFormData(project)]);
  const edited = expense.updatedAt !== expense.createdAt;

  return (
    <div className="flex flex-col gap-6 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ExpenseBreadcrumb
        projectId={projectId}
        current={`${expenseLines(expense).title} · ${dayFirst(expense.date)}`}
        title={t("editTitle")}
        sub={[t("writtenBy", { name: expense.createdBy, when: formatDateTime(new Date(expense.createdAt)) }), edited ? null : t("noChangesYet")]
          .filter(Boolean)
          .join(" · ")}
        aside={
          <Link href={projectHref(projectId, "activity")} className="flex items-center gap-1.5 text-sm font-semibold no-underline">
            <Icon name="history" size={16} strokeWidth={2} />
            {t("history")}
          </Link>
        }
      />
      <EditExpenseForm
        {...data}
        expense={expense}
        memoHref={expense.hasMemo ? `/api/projects/${projectId}/expenses/${expense.id}/memo` : null}
        totals={{
          partyDue: Object.fromEntries([...data.suppliers, ...data.contractors].map((p) => [p.id, p.due])),
          categoryTotal: data.categoryTotals,
          phaseSpent: Object.fromEntries(data.phases.map((p) => [p.id, p.spent])),
          accountBalance: Object.fromEntries(data.accounts.map((a) => [a.name, a.balance])),
          projectSpent: project.spent,
        }}
      />
    </div>
  );
}
