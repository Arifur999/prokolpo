import type { IAttendanceDay } from "@/types/books.types";

// Attendance arithmetic shared by the attendance grid and the contractor ledger. Weeks run
// Sunday to Saturday; Friday is the weekly holiday.

export const FRIDAY = 5;
const DAY_MS = 86_400_000;

type TeamDay = Pick<IAttendanceDay, "headcount" | "halfDay" | "rate">;

// "6", or "6½" for a half day: how the grid writes a team-day.
export const manDays = (d: Pick<IAttendanceDay, "headcount" | "halfDay">) => d.headcount * (d.halfDay ? 0.5 : 1);

// The wage of one team-day, as the API counts it (whole taka, rounded down).
export const dayWage = (d: TeamDay) => Math.floor((d.headcount * d.rate) / (d.halfDay ? 2 : 1));

export const sumManDays = (days: Pick<IAttendanceDay, "headcount" | "halfDay">[]) => days.reduce((sum, d) => sum + manDays(d), 0);
export const sumWages = (days: TeamDay[]) => days.reduce((sum, d) => sum + dayWage(d), 0);

const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// The Sunday on or before an ISO date.
export const weekStart = (iso: string) => {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return toIso(ms - new Date(ms).getUTCDay() * DAY_MS);
};

// The seven ISO dates of the week starting on `start`.
export const weekDates = (start: string) => Array.from({ length: 7 }, (_, i) => toIso(Date.parse(`${start}T00:00:00Z`) + i * DAY_MS));

export const shiftWeek = (start: string, weeks: number) => toIso(Date.parse(`${start}T00:00:00Z`) + weeks * 7 * DAY_MS);

// "6½" / "6" / "1.5": man-days written the way the boards do.
export const manDaysText = (n: number) => {
  const whole = Math.floor(n);
  if (n === whole) return String(n);
  return n - whole === 0.5 ? (whole ? `${whole}½` : "½") : String(n);
};
