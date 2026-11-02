import { describe, expect, it } from "vitest";
import { dueOf, percentText, proportionalShares, splitCall } from "./partnerMath";

describe("partner math", () => {
  it("owes the commitment and call parts less what was paid", () => {
    expect(dueOf({ committed: 4_000_000, callShare: 400_000, paid: 3_400_000 })).toBe(1_000_000);
  });

  it("splits a call by share, the remainder to the biggest", () => {
    expect(splitCall(2_000_000, [400, 250, 200, 150])).toEqual([800_000, 500_000, 400_000, 300_000]);
    expect(splitCall(1_000_001, [667, 333])).toEqual([667_001, 333_000]);
  });

  it("takes a newcomer's share from everyone at the same rate", () => {
    const next = proportionalShares(
      [
        { id: "a", share: 40 },
        { id: "b", share: 25 },
        { id: "c", share: 20 },
        { id: "d", share: 15 },
      ],
      10,
    );
    expect(next).toEqual({ a: 36, b: 22.5, c: 18, d: 13.5 });
    const thirds = proportionalShares(
      [
        { id: "a", share: 66.7 },
        { id: "b", share: 33.3 },
      ],
      15,
    );
    expect((thirds.a ?? 0) + (thirds.b ?? 0)).toBeCloseTo(85);
    expect(percentText(22.5)).toBe("22.5%");
  });
});
