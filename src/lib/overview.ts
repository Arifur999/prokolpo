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

// The money figures on the overview. Every one is 0 until its books have entries; the
// expense, payment and sales modules fill them in as they arrive.
export type OverviewFigures = {
  cash: number;
  supplierDue: number;
  supplierCount: number;
  contractorDue: number;
  contractorCount: number;
  partnerDue: number;
  partnersOwing: number;
  partnerCount: number;
  customerDue: number;
  saleCount: number;
  monthInstallments: number;
  monthInstallmentCount: number;
  overdueAmount: number;
  overdueCount: number;
  monthSpent: number;
};

export const startingFigures = (): OverviewFigures => ({
  cash: 0,
  supplierDue: 0,
  supplierCount: 0,
  contractorDue: 0,
  contractorCount: 0,
  partnerDue: 0,
  partnersOwing: 0,
  partnerCount: 0,
  customerDue: 0,
  saleCount: 0,
  monthInstallments: 0,
  monthInstallmentCount: 0,
  overdueAmount: 0,
  overdueCount: 0,
  monthSpent: 0,
});
