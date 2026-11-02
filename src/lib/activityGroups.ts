import type { IActivityItem } from "@/types/members.types";
import { dhakaToday } from "./dhakaTime";

// How far back the activity page looks, in days; 7 is the default.
export const ACTIVITY_PERIODS = ["7", "30", "90", "all"] as const;
export type ActivityPeriod = (typeof ACTIVITY_PERIODS)[number];
export const isActivityPeriod = (value: string): value is ActivityPeriod => (ACTIVITY_PERIODS as readonly string[]).includes(value);

export type DayGroup = { day: string; items: IActivityItem[] };

// Newest-first entries split by their day in Dhaka ("2026-10-03"), keeping the order.
export const groupByDay = (items: IActivityItem[]): DayGroup[] => {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const day = dhakaToday(new Date(item.createdAt));
    const last = groups.at(-1);
    if (last?.day === day) last.items.push(item);
    else groups.push({ day, items: [item] });
  }
  return groups;
};

// "2026-09-27" -> "27/09", the start of a range whose end shows the year.
export const shortDay = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

// "2026-10-03" moved by days: -1 is the day before ("গতকাল").
export const shiftDay = (day: string, days: number) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
