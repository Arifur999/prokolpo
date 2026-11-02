import { describe, expect, it } from "vitest";
import { dayWage, manDays, manDaysText, shiftWeek, sumWages, weekDates, weekStart } from "./attendance";

describe("attendance", () => {
  it("counts half days at half the wage", () => {
    const half = { headcount: 6, halfDay: true, rate: 1200 };
    expect(manDays(half)).toBe(3);
    expect(dayWage(half)).toBe(3600);
    expect(sumWages([half, { headcount: 6, halfDay: false, rate: 1200 }])).toBe(10800);
  });

  it("runs weeks from Sunday", () => {
    expect(weekStart("2026-10-02")).toBe("2026-09-27");
    expect(weekDates("2026-09-27")[6]).toBe("2026-10-03");
    expect(shiftWeek("2026-09-27", -1)).toBe("2026-09-20");
  });

  it("writes halves with ½", () => {
    expect([6, 6.5, 0.5, 31].map(manDaysText)).toEqual(["6", "6½", "½", "31"]);
  });
});
