// A browser as people name it ("Android ফোন · Chrome") from its user agent: the kind of
// device, its system and the browser. Unknown parts fall back to "Other".

export type DeviceKind = "phone" | "pc";
export type DeviceInfo = { kind: DeviceKind; os: "Android" | "iPhone" | "Windows" | "Mac" | "Linux" | "Other"; browser: string };

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

export const deviceInfo = (userAgent: string | null): DeviceInfo => {
  const ua = userAgent ?? "";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad/.test(ua)
      ? "iPhone"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "Mac"
          : /Linux/.test(ua)
            ? "Linux"
            : "Other";
  const browser = BROWSERS.find(([pattern]) => pattern.test(ua))?.[1] ?? "";
  return { kind: os === "Android" || os === "iPhone" || /Mobile/.test(ua) ? "phone" : "pc", os, browser };
};
