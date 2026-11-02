import { describe, expect, it } from "vitest";
import bn from "../../messages/bn.json";
import en from "../../messages/en.json";

const keyPaths = (node: unknown, prefix = ""): string[] =>
  node && typeof node === "object" ? Object.entries(node).flatMap(([key, value]) => keyPaths(value, prefix ? `${prefix}.${key}` : key)) : [prefix];

describe("messages", () => {
  it("en.json has exactly the keys bn.json has", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(bn).sort());
  });
});
