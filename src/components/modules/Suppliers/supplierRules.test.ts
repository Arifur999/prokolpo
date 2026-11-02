import { describe, expect, it } from "vitest";
import type { ISupplier } from "@/types/books.types";
import { daysOwed, sortSuppliers, supplierTotals } from "./supplierRules";

const supplier = (id: string, overrides: Partial<ISupplier>) =>
  ({ id, name: id, phone: null, supplies: [], billed: 0, paid: 0, due: 0, lastDate: null, oldestDueDate: null, ...overrides }) as ISupplier;

const list = [
  supplier("ক", { billed: 500, paid: 300, due: 200, oldestDueDate: "2026-09-05" }),
  supplier("খ", { billed: 900, paid: 900, due: 0, lastDate: "2026-10-02" }),
  supplier("গ", { billed: 100, paid: 0, due: 100, oldestDueDate: "2026-09-30" }),
];

describe("supplier rules", () => {
  it("counts the days the oldest unpaid bill has waited", () => {
    expect(daysOwed(list[0]!, "2026-10-03")).toBe(28);
    expect(daysOwed(list[1]!, "2026-10-03")).toBe(0);
  });

  it("sorts by due and pins a new supplier on top", () => {
    expect(sortSuppliers(list, "due", null).map((s) => s.id)).toEqual(["ক", "গ", "খ"]);
    expect(sortSuppliers(list, "due", "খ").map((s) => s.id)).toEqual(["খ", "ক", "গ"]);
  });

  it("adds up the summary cards", () => {
    const totals = supplierTotals(list, "2026-10-03");
    expect(totals).toMatchObject({ due: 300, owingCount: 2, billed: 1500, paid: 1200, paidPercent: 80 });
    expect(totals.oldest?.supplier.id).toBe("ক");
  });
});
