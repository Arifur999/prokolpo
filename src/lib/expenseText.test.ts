import { describe, expect, it } from "vitest";
import type { IExpense } from "@/types/books.types";
import { dayFirst, expenseLines, quantityLine } from "./expenseText";

const bill = (overrides: Partial<IExpense>) => ({ categoryName: "রড", description: null, quantity: null, unit: null, rate: null, ...overrides }) as IExpense;

describe("expense text", () => {
  it("shows quantity times rate under the head", () => {
    expect(expenseLines(bill({ quantity: "5.000", unit: "টন", rate: 95000 }))).toEqual({ title: "রড", sub: "5 টন × ৳ 95,000" });
  });

  it("puts a description first and the head under it", () => {
    expect(expenseLines(bill({ description: "মিক্সার মেশিন ভাড়া", categoryName: "অন্যান্য" }))).toEqual({ title: "মিক্সার মেশিন ভাড়া", sub: "অন্যান্য" });
  });

  it("writes a quantity without a rate on its own", () => {
    expect(quantityLine(bill({ quantity: "50", unit: "কেজি" }))).toBe("50 কেজি");
    expect(dayFirst("2026-09-30")).toBe("30/09/2026");
  });
});
