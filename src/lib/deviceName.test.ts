import { describe, expect, it } from "vitest";
import { deviceInfo } from "./deviceName";

describe("deviceInfo", () => {
  it("reads phones and computers with their browser", () => {
    expect(deviceInfo("Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36")).toEqual({
      kind: "phone",
      os: "Android",
      browser: "Chrome",
    });
    expect(deviceInfo("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36 Edg/140.0")).toEqual({
      kind: "pc",
      os: "Windows",
      browser: "Edge",
    });
    expect(deviceInfo(null)).toEqual({ kind: "pc", os: "Other", browser: "" });
  });
});
