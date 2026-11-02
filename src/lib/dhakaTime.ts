import type { Locale } from "@/i18n/config";

// Times people read on the maintenance page, in Bangladesh time whatever the server's zone.
// Bangla names the part of the day ("রাত 1টা"), as the design writes it; English uses am/pm.

const DHAKA = "Asia/Dhaka";

const dhakaParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: DHAKA, hour: "numeric", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute };
};

const banglaPartOfDay = (hour: number) => {
  if (hour >= 4 && hour < 6) return "ভোর";
  if (hour >= 6 && hour < 12) return "সকাল";
  if (hour >= 12 && hour < 15) return "দুপুর";
  if (hour >= 15 && hour < 18) return "বিকেল";
  if (hour >= 18 && hour < 20) return "সন্ধ্যা";
  return "রাত";
};

const twelveHour = (hour: number) => hour % 12 || 12;
const pad = (minute: number) => String(minute).padStart(2, "0");

// "রাত 1টা" / "1 am"; minutes appear only when they are not :00.
export const formatHour = (date: Date, locale: Locale) => {
  const { hour, minute } = dhakaParts(date);
  if (locale === "en") return `${twelveHour(hour)}${minute ? `:${pad(minute)}` : ""} ${hour < 12 ? "am" : "pm"}`;
  return `${banglaPartOfDay(hour)} ${twelveHour(hour)}${minute ? `:${pad(minute)}` : "টা"}`;
};

// "রাত 12:20" / "12:20 am": a moment someone checked.
export const formatClock = (date: Date, locale: Locale) => {
  const { hour, minute } = dhakaParts(date);
  if (locale === "en") return `${twelveHour(hour)}:${pad(minute)} ${hour < 12 ? "am" : "pm"}`;
  return `${banglaPartOfDay(hour)} ${twelveHour(hour)}:${pad(minute)}`;
};
