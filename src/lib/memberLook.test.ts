import { describe, expect, it } from "vitest";
import { lastActive, nameInitials } from "./memberLook";

describe("member look", () => {
  it("takes the first letters of the first and last word", () => {
    expect(nameInitials("আব্দুল করিম")).toBe("আক");
    expect(nameInitials("মোঃ জাকির হোসেন")).toBe("জহ");
    expect(nameInitials("Tania")).toBe("T");
  });

  it("says online, today's time, a date or never", () => {
    const now = new Date("2026-10-03T05:30:00Z"); // 11:30 in Dhaka
    expect(lastActive(null, now)).toEqual({ kind: "never" });
    expect(lastActive("2026-10-03T05:25:00Z", now)).toEqual({ kind: "online" });
    expect(lastActive("2026-10-03T05:10:00Z", now)).toEqual({ kind: "today", time: "11:10" });
    expect(lastActive("2026-10-01T05:20:00Z", now)).toEqual({ kind: "date", date: "01/10/2026" });
  });
});
