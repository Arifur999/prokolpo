import { describe, expect, it } from "vitest";
import { passwordStrength, resetPasswordScore } from "./passwordStrength";

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

describe("resetPasswordScore", () => {
  it.each([
    ["", 0],
    ["abc", 0],
    ["abcdefgh", 1],
    ["abcdefg1", 2],
    ["abcdefghijk1", 3],
    ["Abcdefghijk1", 4],
  ] as const)("%s scores %i", (password, want) => {
    expect(resetPasswordScore(password)).toBe(want);
  });
});
