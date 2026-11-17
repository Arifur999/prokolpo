import { describe, expect, it } from "vitest";
import { generateManagerPassword } from "./managerPassword";

describe("generateManagerPassword", () => {
  it("makes eight readable characters with a digit", () => {
    for (let i = 0; i < 200; i += 1) {
      const password = generateManagerPassword();
      expect(password).toMatch(/^[a-hjkmnp-z2-9]{8}$/);
      expect(password).toMatch(/\d/);
    }
  });

  it("puts a digit in when the letters came out alone", () => {
    expect(generateManagerPassword(new Uint32Array([0, 0, 0, 0, 0, 0, 0, 0, 3]))).toBe("aaa5aaaa");
  });
});
