import { describe, expect, it } from "vitest";
import { monthName, monthRange, recentMonths } from "./months";

describe("months", () => {
  const now = new Date("2026-09-30T20:00:00Z"); // already 1 October in Dhaka

  it("counts back whole months in Dhaka time", () => {
    const months = recentMonths(now, 6);
    expect(months.map((m) => m.getUTCMonth() + 1)).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it("names months for the axis and the range", () => {
    const months = recentMonths(new Date("2026-09-10T00:00:00Z"), 6);
    expect(monthName(months[0]!, "en")).toBe("Apr");
    expect(monthName(months[0]!, "bn")).toBe("এপ্রিল");
    expect(monthRange(months, "en")).toBe("April – September 2026");
  });
});
