"use client";

import { useTranslations } from "next-intl";
import { amountParts, formatAmount } from "@/lib/money";

// "2 কোটি 50 লাখ টাকা" under the budget, so a missing zero is easy to spot.
export function useAmountWords() {
  const t = useTranslations("NewProject.words");

  return (amount: number) => {
    if (!amount) return "";
    const { crore, lakh, thousand, rest } = amountParts(amount);
    const words = [
      crore && t("crore", { n: formatAmount(crore) }),
      lakh && t("lakh", { n: lakh }),
      thousand && t("thousand", { n: thousand }),
      rest && String(rest),
    ].filter(Boolean);
    return t("taka", { words: words.join(" ") });
  };
}
