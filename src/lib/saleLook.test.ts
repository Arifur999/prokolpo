import { describe, expect, it } from "vitest";
import type { ISale, IScheduleRow } from "@/types/sales.types";
import { allocate, monthRows, overdueRows, quickAmounts, saleState } from "./saleLook";

const row = (no: number, due: string, amount: number, paid = 0) => ({ no, due, amount, paid, paidOn: null, lastPaidOn: null }) as IScheduleRow;
const rows = [row(1, "2026-08-05", 100_000, 100_000), row(2, "2026-09-05", 100_000, 40_000), row(3, "2026-10-05", 100_000), row(4, "2026-11-05", 100_000)];

describe("sale look", () => {
  it("finds what is overdue and what falls in a month", () => {
    expect(overdueRows({ rows }, "2026-10-03").map((r) => r.no)).toEqual([2]);
    const sale = { rows } as ISale;
    expect(monthRows([sale], "2026-10").map((m) => m.row.no)).toEqual([3]);
  });

  it("fills the oldest installment first, as the API does", () => {
    expect(allocate(rows, 110_000)).toEqual([
      { no: 2, due: "2026-09-05", got: 60_000, full: true, leftAfter: 0 },
      { no: 3, due: "2026-10-05", got: 50_000, full: false, leftAfter: 50_000 },
    ]);
    expect(quickAmounts(rows, 260_000)).toEqual({ first: 60_000, two: 160_000, all: 260_000 });
  });

  it("names a sale's state", () => {
    const standing = (due: number, late: boolean) => ({ standing: { due, late: late ? { no: 2 } : null } }) as unknown as ISale;
    expect(saleState(standing(0, false))).toBe("PAID");
    expect(saleState(standing(5, true))).toBe("LATE");
    expect(saleState(standing(5, false))).toBe("RUNNING");
  });
});
