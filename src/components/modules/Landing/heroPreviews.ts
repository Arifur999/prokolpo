// What the hero's sample projects look like; their words live in messages under Landing.preview.
// Same numbers as the dashboard, overview, farm and shop boards in the design.

export const PREVIEW_KINDS = ["building", "farm", "shop"] as const;
export type PreviewKind = (typeof PREVIEW_KINDS)[number];

export const PREVIEW_ROWS = ["s1", "s2", "s3"] as const;
export const RECENT_ROWS = ["r1", "r2", "r3"] as const;

export type AmountTone = "ink" | "gold" | "success";
export type ChipTone = "gold" | "success" | "neutral";

type PreviewLook = {
  isJoint: boolean;
  // Share of budget spent; null for a shop, which tracks sales instead of a budget.
  spentPercent: number | null;
  statTones: Record<(typeof PREVIEW_ROWS)[number], AmountTone>;
  recent: Record<(typeof RECENT_ROWS)[number], { chip: ChipTone; amount: AmountTone }>;
};

export const PREVIEW_LOOKS: Record<PreviewKind, PreviewLook> = {
  building: {
    isJoint: true,
    spentPercent: 62.6,
    statTones: { s1: "ink", s2: "gold", s3: "ink" },
    recent: { r1: { chip: "gold", amount: "ink" }, r2: { chip: "success", amount: "success" }, r3: { chip: "neutral", amount: "ink" } },
  },
  farm: {
    isJoint: false,
    spentPercent: 78.4,
    statTones: { s1: "ink", s2: "success", s3: "gold" },
    recent: { r1: { chip: "success", amount: "success" }, r2: { chip: "success", amount: "success" }, r3: { chip: "success", amount: "success" } },
  },
  shop: {
    isJoint: false,
    spentPercent: null,
    statTones: { s1: "success", s2: "gold", s3: "ink" },
    recent: { r1: { chip: "success", amount: "success" }, r2: { chip: "success", amount: "success" }, r3: { chip: "gold", amount: "gold" } },
  },
};

export const AMOUNT_TONE_CLASS: Record<AmountTone, string> = {
  ink: "text-ink",
  gold: "text-gold-ink",
  success: "text-success",
};

export const CHIP_TONE_CLASS: Record<ChipTone, string> = {
  gold: "bg-gold-tint text-gold-ink",
  success: "bg-brand-tint text-success",
  neutral: "bg-surface-4 text-ink-2",
};
