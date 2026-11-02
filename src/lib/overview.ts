import type { IOverviewData } from "@/types/books.types";
import type { IProject } from "@/types/project.types";
import { menusFor } from "./projectPlan";

// Which overview widgets a project shows, from what it is. Partner figures need a joint
// project; installment figures need something sold in installments (flats, plots).
export const overviewFeatures = (project: Pick<IProject, "kind" | "ownership">) => {
  const menus = menusFor(project);
  return {
    partners: project.ownership === "PARTNERSHIP",
    installments: menus.includes("sales"),
    produceSales: menus.includes("farmSales") || menus.includes("bizSales"),
  };
};

// The money figures on the overview. Partner and sales figures read 0 until the sales
// books (Phase 7) fill them.
export type OverviewFigures = IOverviewData["figures"] & {
  partnerDue: number;
  partnersOwing: number;
  partnerCount: number;
  customerDue: number;
  saleCount: number;
  monthInstallments: number;
  monthInstallmentCount: number;
  overdueAmount: number;
  overdueCount: number;
};

export const overviewFigures = (books: IOverviewData["figures"]): OverviewFigures => ({
  ...books,
  partnerDue: 0,
  partnersOwing: 0,
  partnerCount: 0,
  customerDue: 0,
  saleCount: 0,
  monthInstallments: 0,
  monthInstallmentCount: 0,
  overdueAmount: 0,
  overdueCount: 0,
});

// The five biggest heads, then the rest grouped as one grey row (board Main).
export const topCategories = (categories: IOverviewData["categories"], labourLabel: string, restLabel: (count: number) => string) => {
  const named = categories.map((c) => ({ name: c.labour ? labourLabel : c.name, amount: c.amount }));
  const top = named.slice(0, 5);
  const rest = named.slice(5);
  return rest.length ? [...top, { name: restLabel(rest.length), amount: rest.reduce((sum, c) => sum + c.amount, 0), rest: true }] : top;
};
