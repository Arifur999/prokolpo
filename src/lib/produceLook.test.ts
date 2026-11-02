import { describe, expect, it } from "vitest";
import type { IBatch, IProduceBook, IProduceSale } from "@/types/produce.types";
import { batchStarted, incomeMix, lastSale, perKilo, produceSummary, productsFor, saleAmount } from "./produceLook";

const batch = (over: Partial<IBatch>): IBatch => ({
  id: "b",
  name: "১ম ব্যাচ",
  startedOn: "2026-03-10",
  endedOn: "2026-04-14",
  headCount: 1500,
  losses: 48,
  note: null,
  cost: 412_000,
  sales: 0,
  weight: 0,
  weightSales: 0,
  ...over,
});

const sale = (over: Partial<IProduceSale>): IProduceSale => ({
  id: "s",
  date: "2026-10-02",
  phaseId: null,
  product: "BROILER",
  unit: "KG",
  quantity: 900,
  rate: 175,
  amount: 157_500,
  left: 0,
  buyerId: "h",
  buyer: "হানিফ ট্রেডার্স",
  createdAt: "",
  ...over,
});

describe("produceLook", () => {
  it("offers a farm what it makes, and anything else", () => {
    expect(productsFor("POULTRY").map(([p]) => p)).toEqual(["BROILER", "EGG", "LITTER", "SACK", "OTHER"]);
    expect(productsFor("FISH")[0]).toEqual(["FISH", ["KG", "MAUND"]]);
    expect(saleAmount(1050, 174)).toBe(182_700);
    expect(saleAmount(2.5, 33)).toBe(83);
  });

  it("counts finished batches toward profit and the shed", () => {
    const book: IProduceBook = {
      farmType: "POULTRY",
      batches: [
        batch({ id: "b1", sales: 450_000 }),
        batch({ id: "b2", cost: 425_000, sales: 400_000 }),
        batch({ id: "b3", endedOn: null, cost: 408_000, sales: 120_000 }),
        batch({ id: "b4", startedOn: null, endedOn: null, cost: 0 }),
      ],
      setupName: "শেড তৈরি",
      setupCost: 650_000,
      sales: [sale({}), sale({ amount: 30_000, product: "LITTER", unit: "SACK" })],
      dues: [{ buyerId: "h", buyer: "হানিফ", amount: 37_500, since: "2026-10-02" }],
      buyers: [],
    };
    const s = produceSummary(book);
    expect(s).toMatchObject({ total: 187_500, batchCount: 3, finished: 2, gains: 1, profit: 13_000, due: 37_500 });
    expect(s.setupPercent).toBeCloseTo(2, 0);
    expect(s.setupLeft).toBe(637_000);
    expect(batchStarted(book.batches[3]!)).toBe(false);
  });

  it("works out kilo prices and the income mix", () => {
    expect(perKilo(batch({ cost: 412_000, weight: 2730, weightSales: 433_900 }))).toEqual({ cost: 412_000 / 2730, price: 433_900 / 2730 });
    expect(perKilo(batch({}))).toBeNull();
    const mix = incomeMix([sale({ amount: 100 }), sale({ product: "LITTER", amount: 300 })]);
    expect(mix.map((m) => [m.product, m.percent])).toEqual([
      ["LITTER", 75],
      ["BROILER", 25],
    ]);
    expect(lastSale([sale({ rate: 175 }), sale({ rate: 160 })], "BROILER", "KG")?.rate).toBe(175);
  });
});
