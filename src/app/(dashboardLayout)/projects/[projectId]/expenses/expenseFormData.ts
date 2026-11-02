import "server-only";
import type { ExpenseFormData } from "@/components/modules/Expenses/form/NewExpenseForm";
import { getAccounts, getCategories, getContractors, getOverview, getSuppliers } from "@/services/books.services";
import type { IProject } from "@/types/project.types";

// Everything the new and edit expense pages offer to pick from, with today's totals for the
// "what saving does" panel.
export const loadExpenseFormData = async (project: IProject): Promise<ExpenseFormData> => {
  const [categories, suppliers, contractors, accounts, overview] = await Promise.all([
    getCategories(project.id),
    getSuppliers(project.id),
    getContractors(project.id),
    getAccounts(project.id),
    getOverview(project.id),
  ]);
  const party = ({ id, name, due }: { id: string; name: string; due: number }) => ({ id, name, due });
  return {
    projectId: project.id,
    categories: categories.data,
    suppliers: suppliers.data.map(party),
    contractors: contractors.data.map(party),
    phases: project.phases.map(({ id, name, budget, spent }) => ({ id, name, budget, spent })),
    accounts: accounts.data.map(({ id, name, balance }) => ({ id, name, balance })),
    categoryTotals: Object.fromEntries(overview.data.categories.filter((c) => !c.labour).map((c) => [c.name, c.amount])),
  };
};
