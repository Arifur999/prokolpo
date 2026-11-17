import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("আব্দুল", "করিম")).toBe("আক");
    expect(initials("আব্দুল করিম", "")).toBe("আক");
    expect(initials("  Tania  Rahman Khan ")).toBe("TR");
    expect(initials("করিম")).toBe("ক");
  });
});
