import type { IContractor, ISupplier } from "@/types/books.types";
import type { IPartner } from "@/types/partners.types";
import type { ISale } from "@/types/sales.types";
import { dueOf } from "./partnerMath";

const DAY_MS = 86_400_000;

// What a line says under the name; the page words it.
export type DueNote =
  | { kind: "next"; unit: string; date: string }
  | { kind: "late"; unit: string; days: number }
  | { kind: "pledge" }
  | { kind: "call"; committed: number; call: number }
  | { kind: "lastBill"; date: string }
  | { kind: "owing"; days: number }
  | { kind: "daily" }
  | { kind: "contract" }
  | { kind: "none" };

export type DueItem = { id: string; name: string; amount: number; note: DueNote; red: boolean };
export type DueGroup = { key: "customers" | "partners" | "suppliers" | "contractors"; get: boolean; items: DueItem[]; total: number };

const group = (key: DueGroup["key"], get: boolean, items: DueItem[]): DueGroup => ({
  key,
  get,
  items: items.filter((i) => i.amount > 0).sort((a, b) => b.amount - a.amount),
  total: items.reduce((n, i) => n + Math.max(0, i.amount), 0),
});

type DuesInput = { sales: ISale[] | null; partners: IPartner[] | null; suppliers: ISupplier[]; contractors: IContractor[]; today: string };

// Owed and owing (board Reports, DUES): customers and partners owe the project; it owes
// suppliers and contractors. A month or more overdue reads red.
export const duesReport = ({ sales, partners, suppliers, contractors, today }: DuesInput) => {
  const days = (iso: string) => Math.round((Date.parse(today) - Date.parse(iso.slice(0, 10))) / DAY_MS);
  const groups: DueGroup[] = [];
  if (sales) {
    groups.push(
      group(
        "customers",
        true,
        sales.map((s) => ({
          id: s.id,
          name: s.customer,
          amount: s.standing.due,
          red: !!s.standing.late,
          note: s.standing.late
            ? { kind: "late", unit: s.unitName, days: s.standing.late.days }
            : s.standing.next
              ? { kind: "next", unit: s.unitName, date: s.standing.next.date.slice(0, 10) }
              : { kind: "none" },
        })),
      ),
    );
  }
  groups.push(
    group(
      "suppliers",
      false,
      suppliers.map((s) => {
        const owing = s.oldestDueDate ? days(s.oldestDueDate) : 0;
        return {
          id: s.id,
          name: s.name,
          amount: s.due,
          red: owing > 30,
          note: owing > 30 ? { kind: "owing", days: owing } : s.lastDate ? { kind: "lastBill", date: s.lastDate.slice(0, 10) } : { kind: "none" },
        };
      }),
    ),
  );
  if (partners) {
    groups.push(
      group(
        "partners",
        true,
        partners.map((p) => ({
          id: p.id,
          name: p.name,
          amount: dueOf(p),
          red: false,
          note: p.callShare ? { kind: "call", committed: p.committed, call: p.callShare } : { kind: "pledge" },
        })),
      ),
    );
  }
  groups.push(
    group(
      "contractors",
      false,
      contractors.map((c) => ({ id: c.id, name: c.name, amount: c.due, red: false, note: { kind: c.payType === "DAILY" ? "daily" : "contract" } })),
    ),
  );
  const get = groups.filter((g) => g.get).reduce((n, g) => n + g.total, 0);
  const give = groups.filter((g) => !g.get).reduce((n, g) => n + g.total, 0);
  return { groups, get, give };
};
