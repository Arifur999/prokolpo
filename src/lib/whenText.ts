import { dhakaToday, formatDate, formatTime } from "./dhakaTime";

type DayWords = (key: "today" | "yesterday", values: { time: string }) => string;

// When something happened, as the admin pages say it: "আজ 11:20" or "গতকাল 11:20" (t is the
// Admin.dashboard namespace), else the date, with the time when asked. `now` comes from the
// page, keeping render pure.
export const whenText = (iso: string, now: string, t: DayWords, withTime = false) => {
  const at = new Date(iso);
  const day = dhakaToday(at);
  if (day === dhakaToday(new Date(now))) return t("today", { time: formatTime(at) });
  if (day === dhakaToday(new Date(Date.parse(now) - 86_400_000))) return t("yesterday", { time: formatTime(at) });
  return withTime ? `${formatDate(at)} ${formatTime(at)}` : formatDate(at);
};
