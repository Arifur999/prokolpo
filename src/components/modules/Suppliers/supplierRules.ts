import type { ISupplier } from "@/types/books.types";

export type SupplierSort = "due" | "recent" | "billed" | "name";

const DAY_MS = 86_400_000;

// Whole days since the oldest bill still not covered by payments; 0 when nothing is owed.
export const daysOwed = (s: Pick<ISupplier, "due" | "oldestDueDate">, today: string) =>
  s.due > 0 && s.oldestDueDate ? Math.max(0, Math.floor((Date.parse(today) - Date.parse(s.oldestDueDate.slice(0, 10))) / DAY_MS)) : 0;

const SORTERS: Record<SupplierSort, (a: ISupplier, b: ISupplier) => number> = {
  due: (a, b) => b.due - a.due,
  recent: (a, b) => (b.lastDate ?? "").localeCompare(a.lastDate ?? ""),
  billed: (a, b) => b.billed - a.billed,
  name: (a, b) => a.name.localeCompare(b.name, "bn"),
};

// Sorted as asked, with one just-added supplier pinned on top (board SupplierAdd).
export const sortSuppliers = (list: ISupplier[], sort: SupplierSort, pinned: string | null) => {
  const sorted = [...list].sort(SORTERS[sort]);
  const index = sorted.findIndex((s) => s.id === pinned);
  return index > 0 ? [sorted[index]!, ...sorted.slice(0, index), ...sorted.slice(index + 1)] : sorted;
};

// The summary cards over the list.
export const supplierTotals = (suppliers: ISupplier[], today: string) => {
  const owing = suppliers.filter((s) => s.due > 0);
  const billed = suppliers.reduce((sum, s) => sum + s.billed, 0);
  const paid = suppliers.reduce((sum, s) => sum + s.paid, 0);
  const oldest = owing.map((s) => ({ supplier: s, days: daysOwed(s, today) })).sort((a, b) => b.days - a.days)[0] ?? null;
  return { due: owing.reduce((sum, s) => sum + s.due, 0), owingCount: owing.length, billed, paid, paidPercent: billed ? (paid / billed) * 100 : 0, oldest };
};
