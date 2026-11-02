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

// Which greeting fits now: "শুভ সকাল" before noon, "শুভ দুপুর" until five, then "শুভ সন্ধ্যা".
export type DayPart = "morning" | "afternoon" | "evening";
export const dayPart = (date: Date): DayPart => {
  const { hour } = dhakaParts(date);
  if (hour >= 4 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
};

// "30/09/2026", the design's date everywhere.
export const formatDate = (date: Date) => new Intl.DateTimeFormat("en-GB", { timeZone: DHAKA, day: "2-digit", month: "2-digit", year: "numeric" }).format(date);

// "21:40".
export const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: DHAKA, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);

// "30/09/2026 21:40".
export const formatDateTime = (date: Date) => `${formatDate(date)} ${formatTime(date)}`;

// "বুধবার, 30/09/2026" / "Wednesday, 30/09/2026".
export const formatWeekdayDate = (date: Date, locale: Locale) =>
  `${new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { timeZone: DHAKA, weekday: "long" }).format(date)}, ${formatDate(date)}`;

// Today in Dhaka as YYYY-MM-DD, for date inputs and the API.
export const dhakaToday = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: DHAKA }).format(date);

// Whole days left until `later`, never below zero.
export const daysUntil = (later: Date, now = new Date()) => Math.max(0, Math.ceil((later.getTime() - now.getTime()) / 86_400_000));
