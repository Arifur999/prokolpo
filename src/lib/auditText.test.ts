import { describe, expect, it } from "vitest";
import { auditLine } from "./auditText";

const words: Record<string, string> = { user_suspend: "suspended {name}'s account", other: "{action}" };
const t = (key: string, values?: Record<string, string | number>) =>
  (words[key] ?? "").replace(/\{(\w+)\}/g, (_, name: string) => String(values?.[name] ?? ""));
const has = (key: string) => key in words;

describe("auditLine", () => {
  it("words an action the messages know, with its reason", () => {
    expect(auditLine({ action: "user.suspend", summary: "Kamrul", details: { reason: "fraud" } }, t, has)).toEqual({
      text: "suspended Kamrul's account",
      reason: "fraud",
    });
  });

  it("shows an action without copy by its raw name", () => {
    expect(auditLine({ action: "user.note", summary: "Kamrul", details: {} }, t, has)).toEqual({ text: "user.note", reason: null });
    expect(auditLine({ action: "other", summary: "", details: {} }, t, has).text).toBe("other");
  });
});
