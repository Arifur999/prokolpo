import { describe, expect, it } from "vitest";
import type { IExpenseReport } from "@/types/books.types";
import type { IPartner } from "@/types/partners.types";
import type { ISale, IScheduleRow, IUnit } from "@/types/sales.types";
import { collectionReport } from "./reportCollection";
import { duesReport } from "./reportDues";
import { headRows, monthStats, niceTop, phaseRows, supplierRows } from "./reportExpense";
import { profitReport } from "./reportProfit";

const row = (no: number, due: string, paid: number, paidOn: string | null = null): IScheduleRow => ({
  no,
  due,
  amount: 85_000,
  paid,
  paidOn,
  lastPaidOn: paidOn,
});

const sale = (over: Partial<ISale>): ISale =>
  ({
    id: "s1",
    unitName: "ফ্ল্যাট ৩-বি",
    customer: "নাসরিন আক্তার",
    price: 5_400_000,
    installments: 24,
    standing: { received: 3_700_000, due: 1_700_000, paidCount: 4, next: null, late: null, lateCount: 0, lateSum: 0, status: "BOOKED", lastPaid: null },
    rows: [],
    ...over,
  }) as ISale;

describe("report helpers", () => {
  it("rounds chart tops to a clean step", () => {
    expect(niceTop(2_640_000)).toBe(3_000_000);
    expect(niceTop(28_650)).toBe(30_000);
    expect(niceTop(0)).toBe(3);
  });

  it("groups spending by head, phase, supplier and month", () => {
    const r: IExpenseReport = {
      from: "2026-01-01",
      to: "2026-10-03",
      budget: 25_000_000,
      categories: [
        { name: "রড", amount: 3_820_000, labour: false },
        { name: "", amount: 3_150_000, labour: true },
        { name: "রং", amount: 0, labour: false },
      ],
      phases: [{ name: "পাইলিং", amount: 3_250_000, budget: 3_200_000 }],
      unphased: 1_800_000,
      months: [
        { month: "2026-06", amount: 1_580_000 },
        { month: "2026-07", amount: 2_640_000 },
      ],
      suppliers: [{ name: "করিম রড স্টোর", billed: 2_870_000, paid: 2_550_000 }],
    };
    expect(headRows(r, "মিস্ত্রি মজুরি").map((h) => h.name)).toEqual(["রড", "মিস্ত্রি মজুরি", "রং"]);
    expect(phaseRows(r, "কোনো তলা নয়").at(-1)).toMatchObject({ name: "কোনো তলা নয়", unphased: true });
    expect(supplierRows(r)[0]!.due).toBe(320_000);
    expect(monthStats(r.months)).toMatchObject({ total: 4_220_000, average: 2_110_000, top: { month: "2026-07" } });
  });

  it("collects installments due to date, late money by age and what is ahead", () => {
    const s = sale({
      rows: [
        row(1, "2026-07-25", 85_000, "2026-07-20"),
        row(2, "2026-08-25", 85_000, "2026-09-01"),
        row(3, "2026-09-25", 40_000),
        row(4, "2026-10-25", 0),
        row(5, "2026-11-25", 0),
      ],
    });
    const c = collectionReport([s, sale({ id: "full", installments: 0, rows: [] })], "2026-10-03");
    expect(c).toMatchObject({ dueToDate: 255_000, paidToDate: 210_000, lateSum: 45_000, lateCount: 1, latePeople: 1, nextThree: 170_000 });
    expect(c.aging).toEqual([45_000, 0, 0]);
    expect(c.customers[0]).toMatchObject({ full: 2, onTime: 1, late: 45_000 });
    expect(c.months).toHaveLength(12);
    expect(c.months.find((m) => m.month === "2026-09")).toMatchObject({ due: 85_000, paid: 40_000, late: 45_000, ahead: false });
  });

  it("splits profit by share after unpaid capital", () => {
    const partners = [
      { id: "a", name: "আব্দুল করিম", share: 60, committed: 6_000_000, callShare: 0, paid: 6_000_000, color: 0 },
      { id: "t", name: "তানিয়া রহমান", share: 40, committed: 4_000_000, callShare: 0, paid: 3_000_000, color: 2 },
    ] as IPartner[];
    const units = [
      { price: 5_000_000, sale: null },
      { price: 1, sale: {} },
    ] as IUnit[];
    const p = profitReport({ sales: [sale({})], units, spent: 3_000_000, budget: 4_000_000, partners, scenario: "BUDGET" });
    expect(p).toMatchObject({ sold: 5_400_000, cost: 4_000_000, rest: 1_000_000, profit: 1_400_000, unsoldCount: 1, unsoldValue: 5_000_000 });
    expect(p.shares[1]).toMatchObject({ part: 560_000, owed: 1_000_000, net: -440_000 });
    expect(profitReport({ sales: [], units: [], spent: 3_000_000, budget: null, partners: [], scenario: "BUDGET" }).onBudget).toBe(false);
  });

  it("lists who owes and whom we owe, biggest first", () => {
    const d = duesReport({
      sales: [sale({ standing: { ...sale({}).standing, due: 480_000, late: { no: 7, date: "2026-09-10", amount: 80_000, days: 23 } } })],
      partners: null,
      suppliers: [
        { id: "m", name: "মা স্টোন সাপ্লাই", due: 200_000, lastDate: "2026-09-01", oldestDueDate: "2026-09-01" },
        { id: "k", name: "করিম রড স্টোর", due: 320_000, lastDate: "2026-09-30", oldestDueDate: "2026-09-30" },
      ] as never,
      contractors: [{ id: "j", name: "জামাল মিস্ত্রির দল", due: 185_000, payType: "DAILY" }] as never,
      today: "2026-10-03",
    });
    expect(d.groups.map((g) => g.key)).toEqual(["customers", "suppliers", "contractors"]);
    expect(d.groups[1]!.items.map((i) => i.name)).toEqual(["করিম রড স্টোর", "মা স্টোন সাপ্লাই"]);
    expect(d.groups[1]!.items[1]).toMatchObject({ red: true, note: { kind: "owing", days: 32 } });
    expect(d).toMatchObject({ get: 480_000, give: 705_000 });
  });
});
