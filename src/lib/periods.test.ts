import { describe, expect, it } from "vitest";
import { periodRange } from "./periods";

describe("periodRange", () => {
  const now = new Date("2026-09-30T20:00:00Z"); // 1 October in Dhaka

  it("covers this month and the one before in Dhaka time", () => {
    expect(periodRange("month", now)).toEqual({ from: "2026-10-01", to: "2026-10-31", label: "01/10 – 31/10/2026" });
    expect(periodRange("last", now)).toMatchObject({ from: "2026-09-01", to: "2026-09-30" });
  });
});
