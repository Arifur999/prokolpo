import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExpenseBreadcrumb } from "@/components/modules/Expenses/ExpenseBreadcrumb";
import { blankExpense } from "@/components/modules/Expenses/form/expenseValues";
import { NewExpenseForm } from "@/components/modules/Expenses/form/NewExpenseForm";
import { dhakaToday } from "@/lib/dhakaTime";
import { projectHref } from "@/lib/routes";
import { loadExpenseFormData } from "../expenseFormData";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("ExpenseForm"))("newTitle") };
}

// Board ExpenseNew.
export default async function NewExpensePage({ params }: PageProps<"/projects/[projectId]/expenses/new">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  if (project.role === "VIEWER") redirect(projectHref(projectId, "expenses"));

  const [t, data] = await Promise.all([getTranslations("ExpenseForm"), loadExpenseFormData(project)]);
  const cash = data.accounts[0]?.id ?? "";

  return (
    <div className="flex flex-col gap-6 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ExpenseBreadcrumb projectId={projectId} current={t("newCurrent")} title={t("newTitle")} />
      <NewExpenseForm {...data} defaults={{ ...blankExpense(dhakaToday(), data.suppliers[0]?.id, cash), categoryId: data.categories[0]?.id ?? "" }} />
    </div>
  );
}
