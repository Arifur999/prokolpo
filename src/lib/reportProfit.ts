import type { IPartner } from "@/types/partners.types";
import type { ISale, IUnit } from "@/types/sales.types";
import { dueOf } from "./partnerMath";

export type Scenario = "BUDGET" | "NOW";

type ProfitInput = { sales: ISale[]; units: IUnit[]; spent: number; budget: number | null; partners: IPartner[]; scenario: Scenario };

// Profit and the partners' shares (board ReportProfit): what was sold less what it costs —
// either all the budget, or only what is spent so far — split by share, less unpaid capital.
export const profitReport = ({ sales, units, spent, budget, partners, scenario }: ProfitInput) => {
  const onBudget = scenario === "BUDGET" && budget !== null;
  const sold = sales.reduce((n, s) => n + s.price, 0);
  const cost = onBudget ? Math.max(budget, spent) : spent;
  const profit = sold - cost;
  const unsold = units.filter((u) => !u.sale);
  const shares = partners.map((p) => {
    const part = Math.round((profit * p.share) / 100);
    const owed = Math.max(0, dueOf(p));
    return { id: p.id, name: p.name, color: p.color, share: p.share, capital: p.paid, part, owed, net: part - owed };
  });
  return {
    onBudget,
    sold,
    received: sales.reduce((n, s) => n + s.standing.received, 0),
    customerDue: sales.reduce((n, s) => n + Math.max(0, s.standing.due), 0),
    soldCount: sales.length,
    spent,
    rest: onBudget ? Math.max(0, cost - spent) : 0,
    cost,
    profit,
    unsoldCount: unsold.length,
    unsoldValue: unsold.reduce((n, u) => n + u.price, 0),
    shares,
    capital: shares.reduce((n, s) => n + s.capital, 0),
    owed: shares.reduce((n, s) => n + s.owed, 0),
  };
};
