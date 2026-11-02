// A browser as people name it ("Android ফোন · Chrome") from its user agent: the kind of
// device, its system and the browser. Unknown parts fall back to "Other".

export type DeviceKind = "phone" | "tablet" | "pc";
export type DeviceInfo = { kind: DeviceKind; os: "Android" | "iPhone" | "iPad" | "Windows" | "Mac" | "Linux" | "Other"; browser: string };

// Order matters: Edge, Opera and Samsung also say "Chrome/", and every iOS browser says "Safari/".
const BROWSERS: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, DeviceInfo["os"]][] = [
  [/Android/, "Android"],
  [/iPad/, "iPad"],
  [/iPhone|iPod/, "iPhone"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "Mac"],
  [/Linux/, "Linux"],
];

const kindOf = (os: DeviceInfo["os"], ua: string): DeviceKind => {
  if (os === "iPad" || (os === "Android" && !/Mobile/.test(ua))) return "tablet";
  return os === "Android" || os === "iPhone" || /Mobile/.test(ua) ? "phone" : "pc";
};

export const deviceInfo = (userAgent: string | null): DeviceInfo => {
  const ua = userAgent ?? "";
  const os = SYSTEMS.find(([pattern]) => pattern.test(ua))?.[1] ?? "Other";
  const browser = BROWSERS.find(([pattern]) => pattern.test(ua))?.[1] ?? "";
  return { kind: kindOf(os, ua), os, browser };
};
