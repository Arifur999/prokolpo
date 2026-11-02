import type { Locale } from "@/i18n/config";

const DHAKA = "Asia/Dhaka";

// The last `count` calendar months up to and including `now`'s, oldest first, in Dhaka time.
export const recentMonths = (now: Date, count: number) => {
  const [year = 0, month = 1] = new Intl.DateTimeFormat("en-CA", { timeZone: DHAKA, year: "numeric", month: "numeric" }).format(now).split("-").map(Number);
  return Array.from({ length: count }, (_, i) => new Date(Date.UTC(year, month - 1 - (count - 1 - i), 15)));
};

// "সেপ্টেম্বর" / "Sep" on the axis; the long name with the year for the range.
export const monthName = (date: Date, locale: Locale, style: "long" | "short" = locale === "bn" ? "long" : "short") =>
  new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { timeZone: DHAKA, month: style }).format(date);

// "এপ্রিল – সেপ্টেম্বর 2026" / "April – September 2026".
export const monthRange = (months: Date[], locale: Locale) => {
  const first = months[0];
  const last = months.at(-1);
  if (!first || !last) return "";
  return `${monthName(first, locale, "long")} – ${monthName(last, locale, "long")} ${last.getUTCFullYear()}`;
};
