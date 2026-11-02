import { dhakaToday, formatDate, formatTime } from "./dhakaTime";

// When something happened, as the admin pages say it: today or yesterday with the time,
// else the date (with the time when asked). `now` comes from the page, keeping render pure.
export const dayLabel = (iso: string, now: string, withTime = false) => {
  const at = new Date(iso);
  const day = dhakaToday(at);
  if (day === dhakaToday(new Date(now))) return { kind: "today" as const, time: formatTime(at), text: formatTime(at) };
  if (day === dhakaToday(new Date(Date.parse(now) - 86_400_000))) return { kind: "yesterday" as const, time: formatTime(at), text: formatTime(at) };
  return { kind: "date" as const, time: formatTime(at), text: withTime ? `${formatDate(at)} ${formatTime(at)}` : formatDate(at) };
};

// The same, worded with "আজ"/"গতকাল" from the Admin.dashboard messages.
export const whenText = (iso: string, now: string, t: (key: "today" | "yesterday", values: { time: string }) => string, withTime = false) => {
  const d = dayLabel(iso, now, withTime);
  return d.kind === "date" ? d.text : t(d.kind, { time: d.time });
};
