import { describe, expect, it } from "vitest";
import { whenText } from "./whenText";

const t = (key: "today" | "yesterday", { time }: { time: string }) => `${key} ${time}`;
// 12:00 in Dhaka (UTC+6).
const now = "2026-11-03T06:00:00.000Z";

describe("whenText", () => {
  it("says today and yesterday by the Dhaka date, with the time", () => {
    expect(whenText("2026-11-02T19:30:00.000Z", now, t)).toBe("today 01:30");
    expect(whenText("2026-11-02T17:59:00.000Z", now, t)).toBe("yesterday 23:59");
  });

  it("gives older days as a date, with the time only when asked", () => {
    expect(whenText("2026-10-30T05:20:00.000Z", now, t)).toBe("30/10/2026");
    expect(whenText("2026-10-30T05:20:00.000Z", now, t, true)).toBe("30/10/2026 11:20");
  });
});
