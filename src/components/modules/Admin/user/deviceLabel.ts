import { deviceInfo } from "@/lib/deviceName";

type T = (key: string, values?: Record<string, string>) => string;

// "Android ফোন · Chrome" in the reader's language; t is the "AdminUser" namespace.
export const deviceLabel = (userAgent: string | null, t: T) => {
  const d = deviceInfo(userAgent);
  const kind = t(`kinds.${d.kind}`, { os: d.os === "Other" ? t("osOther") : d.os });
  return { kind: d.kind, name: [kind, d.browser].filter(Boolean).join(" · "), short: kind };
};
