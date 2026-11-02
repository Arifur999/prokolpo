import { describe, expect, it } from "vitest";
import { normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["01712345678", "01712345678"],
    ["+880 1712-345678", "01712345678"],
    ["8801712345678", "01712345678"],
    ["০১৭১২ ৩৪৫৬৭৮", "01712345678"],
  ])("normalises %s", (raw, want) => {
    expect(normalizePhone(raw)).toBe(want);
  });

  it.each(["", "0171234567", "01212345678", "02712345678", "abc"])("rejects %s", (raw) => {
    expect(normalizePhone(raw)).toBeNull();
  });
});
