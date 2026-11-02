import { describe, expect, it } from "vitest";
import type { IActivityItem } from "@/types/members.types";
import { groupByDay, shiftDay } from "./activityGroups";

const at = (id: string, createdAt: string) => ({ id, createdAt }) as IActivityItem;

describe("activity groups", () => {
  it("splits entries by their day in Dhaka", () => {
    const groups = groupByDay([at("a", "2026-10-03T05:00:00Z"), at("b", "2026-10-02T19:00:00Z"), at("c", "2026-10-02T17:00:00Z")]);
    expect(groups.map((g) => [g.day, g.items.map((i) => i.id)])).toEqual([
      ["2026-10-03", ["a", "b"]],
      ["2026-10-02", ["c"]],
    ]);
  });

  it("finds the day before across a month", () => {
    expect(shiftDay("2026-10-01", -1)).toBe("2026-09-30");
    expect(shiftDay("2026-10-03", -6)).toBe("2026-09-27");
  });
});
