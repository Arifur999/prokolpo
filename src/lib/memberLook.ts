import type { IMember } from "@/types/members.types";
import { formatDate, formatTime } from "./dhakaTime";

// Avatar colours by role (board Members): gold for the owner, green for managers, grey for viewers.
export const ROLE_AVATAR: Record<IMember["role"], string> = {
  OWNER: "bg-gold text-brand",
  MANAGER: "bg-brand-tint text-brand",
  VIEWER: "bg-surface-4 text-ink-2",
};

// "আব্দুল করিম" -> "আক": first letters of the first and last word, "মোঃ" skipped.
export const nameInitials = (name: string) => {
  const words = name
    .replace(/^মোঃ\s*/, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0] ?? "";
  const last = words.length > 1 ? (words.at(-1) ?? "") : "";
  return [first, last].map((word) => Array.from(word)[0] ?? "").join("");
};

const ONLINE_WINDOW = 15 * 60 * 1000;

export type LastActive = { kind: "online" } | { kind: "today"; time: string } | { kind: "date"; date: string } | { kind: "never" };

// How recently a member used the app: a session refresh in the last 15 minutes counts as
// online, today shows the time, older shows the date.
export const lastActive = (iso: string | null, now = new Date()): LastActive => {
  if (!iso) return { kind: "never" };
  const at = new Date(iso);
  if (now.getTime() - at.getTime() < ONLINE_WINDOW) return { kind: "online" };
  if (formatDate(at) === formatDate(now)) return { kind: "today", time: formatTime(at) };
  return { kind: "date", date: formatDate(at) };
};
