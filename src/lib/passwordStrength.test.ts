import { describe, expect, it } from "vitest";
import { passwordStrength } from "./passwordStrength";

describe("passwordStrength", () => {
  it.each([
    ["", 0],
    ["karim", 1],
    ["karimkarim", 1],
    ["karim2026", 2],
    ["Karim2026", 3],
    ["karim2026!", 3],
    ["karimbuilders2026", 3],
  ] as const)("%s is %i", (password, want) => {
    expect(passwordStrength(password)).toBe(want);
  });
});
