import { describe, expect, it } from "vitest";
import { deviceInfo } from "./deviceName";

const UA = {
  androidChrome: "Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36",
  androidEdge: "Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 EdgA/140.0",
  androidSamsung: "Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0 Mobile Safari/537.36",
  androidOpera: "Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36 OPR/90.0",
  androidFirefox: "Mozilla/5.0 (Android 14; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0",
  androidTablet: "Mozilla/5.0 (Linux; Android 14; SM-X210) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  iphoneSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1",
  iphoneFirefox: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Safari/605.1.15",
  iphoneEdge:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/140.0 Mobile/15E148 Safari/605.1.15",
  ipad: "Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  windowsEdge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0",
  windowsFirefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
  macSafari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  linuxChrome: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
};

describe("deviceInfo", () => {
  it.each([
    ["androidChrome", "phone", "Android", "Chrome"],
    ["androidEdge", "phone", "Android", "Edge"],
    ["androidSamsung", "phone", "Android", "Samsung Internet"],
    ["androidOpera", "phone", "Android", "Opera"],
    ["androidFirefox", "phone", "Android", "Firefox"],
    ["androidTablet", "tablet", "Android", "Chrome"],
    ["iphoneSafari", "phone", "iPhone", "Safari"],
    ["iphoneChrome", "phone", "iPhone", "Chrome"],
    ["iphoneFirefox", "phone", "iPhone", "Firefox"],
    ["iphoneEdge", "phone", "iPhone", "Edge"],
    ["ipad", "tablet", "iPad", "Safari"],
    ["windowsEdge", "pc", "Windows", "Edge"],
    ["windowsFirefox", "pc", "Windows", "Firefox"],
    ["macSafari", "pc", "Mac", "Safari"],
    ["linuxChrome", "pc", "Linux", "Chrome"],
  ] as const)("reads %s", (name, kind, os, browser) => {
    expect(deviceInfo(UA[name])).toEqual({ kind, os, browser });
  });

  it("falls back for an empty or missing user agent", () => {
    expect(deviceInfo(null)).toEqual({ kind: "pc", os: "Other", browser: "" });
    expect(deviceInfo("")).toEqual({ kind: "pc", os: "Other", browser: "" });
  });
});
