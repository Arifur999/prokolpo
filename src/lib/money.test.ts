import { describe, expect, it } from "vitest";
import { amountParts, budgetPercent, budgetTone, formatAmount, formatPercent, toLatinDigits, formatQuantity, toDecimalDigits } from "./money";

describe("money", () => {
  it("groups taka the Indian way", () => {
    expect(formatAmount(15640500)).toBe("1,56,40,500");
    expect(formatAmount(0)).toBe("0");
    expect(formatAmount(-0.4)).toBe("0");
  });

  it("writes percentages with at most one decimal", () => {
    expect(formatPercent(budgetPercent(15640500, 25000000) ?? 0)).toBe("62.6%");
    expect(formatPercent(103)).toBe("103%");
    expect(budgetPercent(100, null)).toBeNull();
  });

  it("turns yellow at 90% and red past 100%", () => {
    expect([62.6, 90, 100, 104.5].map(budgetTone)).toEqual(["ok", "near", "near", "over"]);
  });

  it("reads Bangla digits and drops separators", () => {
    expect(toLatinDigits("২,৫০,০০০ টাকা")).toBe("250000");
    expect(toLatinDigits("1200.50")).toBe("1200");
  });

  it("splits an amount into crore, lakh and thousand", () => {
    expect(amountParts(25_012_345)).toEqual({ crore: 2, lakh: 50, thousand: 12, rest: 345 });
  });

  it("keeps quantities to three decimals", () => {
    expect(toDecimalDigits("১০৫০")).toBe("1050");
    expect(toDecimalDigits("2.5.5")).toBe("2.55");
    expect(toDecimalDigits("1.23456")).toBe("1.234");
    expect(formatQuantity(1050)).toBe("1,050");
    expect(formatQuantity(2.5)).toBe("2.5");
  });
});
