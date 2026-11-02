import { describe, expect, it } from "vitest";
import { dayPart, daysUntil, dhakaToday, formatClock, formatDate, formatDateTime, formatHour, formatWeekdayDate } from "./dhakaTime";

// Dhaka is UTC+6 with no daylight saving.
const at = (dhakaTime: string) => new Date(`2026-10-04T${dhakaTime}:00+06:00`);

describe("formatHour", () => {
  it.each([
    ["01:00", "রাত 1টা", "1 am"],
    ["05:00", "ভোর 5টা", "5 am"],
    ["09:30", "সকাল 9:30", "9:30 am"],
    ["13:00", "দুপুর 1টা", "1 pm"],
    ["16:00", "বিকেল 4টা", "4 pm"],
    ["19:00", "সন্ধ্যা 7টা", "7 pm"],
    ["00:00", "রাত 12টা", "12 am"],
  ])("%s", (time, bn, en) => {
    expect(formatHour(at(time), "bn")).toBe(bn);
    expect(formatHour(at(time), "en")).toBe(en);
  });
});

describe("formatClock", () => {
  it("shows minutes", () => {
    expect(formatClock(at("00:20"), "bn")).toBe("রাত 12:20");
    expect(formatClock(at("00:20"), "en")).toBe("12:20 am");
  });
});

describe("dates", () => {
  const sample = new Date("2026-09-30T15:40:00Z"); // 21:40 in Dhaka

  it("formats day-first dates in Dhaka time", () => {
    expect(formatDate(sample)).toBe("30/09/2026");
    expect(formatDateTime(sample)).toBe("30/09/2026 21:40");
    expect(dhakaToday(new Date("2026-10-02T19:30:00Z"))).toBe("2026-10-03");
  });

  it("names the weekday in the reader's language", () => {
    expect(formatWeekdayDate(sample, "en")).toBe("Wednesday, 30/09/2026");
    expect(formatWeekdayDate(sample, "bn")).toBe("বুধবার, 30/09/2026");
  });

  it("picks the greeting for the hour in Dhaka", () => {
    expect(dayPart(new Date("2026-09-30T03:00:00Z"))).toBe("morning");
    expect(dayPart(new Date("2026-09-30T08:00:00Z"))).toBe("afternoon");
    expect(dayPart(sample)).toBe("evening");
  });

  it("counts whole days left", () => {
    expect(daysUntil(new Date("2026-10-06T00:00:00Z"), new Date("2026-10-03T06:00:00Z"))).toBe(3);
    expect(daysUntil(new Date("2026-10-01T00:00:00Z"), sample)).toBe(1);
  });
});
