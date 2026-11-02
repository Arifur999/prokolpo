import { describe, expect, it } from "vitest";
import type { IShopBook, IShopDay } from "@/types/shop.types";
import { expectedCash, khataAfter, monthBefore, sameWeekday, shopFigures } from "./shopLook";

const day = (date: string, cash: number, over: Partial<IShopDay> = {}): IShopDay => ({
  id: date,
  date,
  cash,
  mobile: 0,
  credit: 0,
  collect: 0,
  other: 0,
  note: null,
  counted: null,
  by: "শফিকুল",
  cashAccountId: "c",
  mobileAccountId: "m",
  credits: [],
  collects: [],
  ...over,
});

describe("shopLook", () => {
  it("compares this month with the same days of the last", () => {
    const book: IShopBook = {
      days: [day("2026-10-02", 7800, { mobile: 1600 }), day("2026-10-01", 18750, { credit: 1500 }), day("2026-09-02", 9000), day("2026-09-30", 18400)],
      khata: [{ id: "r", name: "রহিম", due: 18500, since: "2026-09-12", last: "2026-09-30" }],
      expenses: [{ month: "2026-09", amount: 20000 }],
    };
    const f = shopFigures(book, "2026-10-03");
    expect(f).toMatchObject({
      month: "2026-10",
      last: "2026-09",
      total: 29650,
      dayCount: 2,
      sameDaysLast: 9000,
      lastTotal: 27400,
      net: 7400,
      khata: 18500,
      oldest: 21,
    });
    expect(f.bars).toHaveLength(30);
    expect(f.best.date).toBe("2026-09-30");
    expect(f.todayDone).toBe(false);
    expect(monthBefore("2026-01")).toBe("2025-12");
  });

  it("works out the credit book and the drawer after a day", () => {
    const khata = [{ id: "s", name: "সেলিম মিস্ত্রি", due: 7800, since: null, last: null }];
    expect(khataAfter(khata, [{ name: "রহিম কনস্ট্রাকশন", amount: 1400 }], [{ name: "সেলিম মিস্ত্রি", amount: 3000 }])).toBe(6200);
    expect(expectedCash({ cash: 14250, other: 0, collects: [{ name: "সেলিম মিস্ত্রি", amount: 3000 }] })).toBe(17250);
    expect(sameWeekday([day("2026-09-26", 1), day("2026-09-27", 2)], "2026-10-03")?.date).toBe("2026-09-26");
  });
});
