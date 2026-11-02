import { dhakaToday } from "./dhakaTime";

export type Period = "month" | "last" | "all";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const dm = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

// The date range a list period covers, in Bangladesh time, and how the filter names it
// ("01/09 – 30/09/2026").
export const periodRange = (period: Period, now = new Date()) => {
  const [year = 0, month = 1] = dhakaToday(now).split("-").map(Number);
  const offset = period === "last" ? 1 : 0;
  const from = new Date(Date.UTC(year, month - 1 - offset, 1));
  const to = new Date(Date.UTC(year, month - offset, 0));
  return { from: iso(from), to: iso(to), label: `${dm(from)} – ${dm(to)}/${to.getUTCFullYear()}` };
};

export const isPeriod = (value: unknown): value is Period => value === "month" || value === "last" || value === "all";
