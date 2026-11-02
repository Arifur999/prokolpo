import { describe, expect, it } from "vitest";
import { formatClock, formatHour } from "./dhakaTime";

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
