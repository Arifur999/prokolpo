import type { IUnit, UnitStatus, UnitType } from "@/types/sales.types";
import { ordinal, toBanglaDigits } from "./digits";

// A unit is available until sold, booked while money is owed, sold once it is all in.
export const unitStatus = (u: Pick<IUnit, "sale">): UnitStatus => u.sale?.standing.status ?? "AVAILABLE";

// Tile colours by status (board Units): stripe, fill, border and text.
export const STATUS_LOOK: Record<UnitStatus, { tile: string; stripe: string; ink: string; pill: string; swatch: string }> = {
  AVAILABLE: { tile: "bg-[#EEF6F1] border-[#CBE3D5]", stripe: "bg-brand-mid", ink: "text-success", pill: "bg-brand-tint text-success", swatch: "bg-brand-mid" },
  BOOKED: {
    tile: "bg-[#FFF6E5] border-[#F0DDB4]",
    stripe: "bg-gold-strong",
    ink: "text-gold-ink",
    pill: "bg-gold-tint text-gold-ink",
    swatch: "bg-gold-strong",
  },
  SOLD: { tile: "bg-surface-4 border-[#DDDAD1]", stripe: "bg-ink-4", ink: "text-ink-2", pill: "bg-[#E9E7E0] text-ink-2", swatch: "bg-ink-4" },
};

const LETTERS = { bn: ["এ", "বি", "সি", "ডি", "ই", "এফ"], en: ["A", "B", "C", "D", "E", "F"] };
const FLAT = { bn: "ফ্ল্যাট", en: "Flat" };

export const flatLetters = (locale: "bn" | "en", count: number) => LETTERS[locale].slice(0, count);

// "ফ্ল্যাট ৩-বি" / "Flat 3-B": a flat named by floor and its place on it.
export const flatName = (locale: "bn" | "en", floor: number, index: number) =>
  `${FLAT[locale]} ${locale === "bn" ? toBanglaDigits(floor) : floor}-${LETTERS[locale][index] ?? index + 1}`;

// "৩-বি": the short name in the bulk preview.
export const flatShort = (locale: "bn" | "en", floor: number, index: number) =>
  `${locale === "bn" ? toBanglaDigits(floor) : floor}-${LETTERS[locale][index] ?? index + 1}`;

// "৩য়" / "3rd": a floor as the chips show it.
export const floorShort = (locale: "bn" | "en", floor: number) => ordinal(floor, locale);

// Floors to draw: the project's floor count, or as high as any unit goes, top first.
export const floorList = (floors: number | null, units: Pick<IUnit, "floor">[]) => {
  const top = Math.max(floors ?? 1, ...units.map((u) => u.floor), 1);
  return Array.from({ length: top }, (_, i) => top - i);
};

// The types a unit can be; land projects sell plots.
export const typesFor = (kind: string): UnitType[] => (kind === "LAND" ? ["PLOT", "OTHER"] : ["FLAT", "SHOP", "PARKING", "OTHER"]);
