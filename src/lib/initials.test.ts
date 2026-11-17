import { describe, expect, it } from "vitest";
import { firstLetter, initials } from "./initials";

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("আব্দুল", "করিম")).toBe("আক");
    expect(initials("আব্দুল করিম", "")).toBe("আক");
    expect(initials("  Tania  Rahman Khan ")).toBe("TR");
    expect(initials("করিম")).toBe("ক");
  });
});

describe("firstLetter", () => {
  it("keeps the vowel sign with the first letter", () => {
    expect(firstLetter("সোহেল রানা")).toBe("সো");
    expect(firstLetter("জসিম উদ্দিন")).toBe("জ");
    expect(firstLetter(" আব্দুল করিম")).toBe("আ");
    expect(firstLetter("Tania")).toBe("T");
    expect(firstLetter("")).toBe("");
  });
});
