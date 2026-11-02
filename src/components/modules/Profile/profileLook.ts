import type { ProjectRole } from "@/types/project.types";

// "আব্দুল করিম" -> "আক": the first letter of the first two words.
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("");

// The role pill's colours on "আমার প্রজেক্ট ও রোল" (board Profile).
export const ROLE_TONE: Record<ProjectRole, string> = {
  OWNER: "bg-brand-tint text-brand",
  MANAGER: "bg-info-tint text-info",
  VIEWER: "bg-surface-4 text-ink-2",
};
