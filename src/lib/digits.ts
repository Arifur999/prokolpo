import type { Locale } from "@/i18n/config";

// The design writes counts inside names in Bangla digits ("৬ তলা", "৩য় তলা") and money in Latin.

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

export const toBanglaDigits = (n: number) => String(n).replace(/[0-9]/g, (d) => BANGLA_DIGITS.charAt(Number(d)));

export const localDigits = (n: number, locale: Locale) => (locale === "bn" ? toBanglaDigits(n) : String(n));

const BANGLA_ORDINAL_SUFFIX: Record<number, string> = { 1: "ম", 2: "য়", 3: "য়", 4: "র্থ", 5: "ম", 6: "ষ্ঠ", 7: "ম", 8: "ম", 9: "ম", 10: "ম" };

const englishOrdinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
};

// "১ম", "৪র্থ", "১১তম" / "1st", "4th", "11th".
export const ordinal = (n: number, locale: Locale) => (locale === "bn" ? toBanglaDigits(n) + (BANGLA_ORDINAL_SUFFIX[n] ?? "তম") : englishOrdinal(n));
