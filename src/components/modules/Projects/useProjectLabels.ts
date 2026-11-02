"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { localDigits } from "@/lib/digits";
import type { IProjectSummary } from "@/types/project.types";

type KindFields = Pick<IProjectSummary, "kind" | "farmType" | "floors" | "businessType">;

// Bangla counts read in Bangla digits ("৬ তলা"); English needs the number for its plural.
// "বিল্ডিং · ৬ তলা", "খামার · পোল্ট্রি", "ব্যবসা · হার্ডওয়্যার দোকান": what a project is, in one line.
export function useProjectLabels() {
  const t = useTranslations("Projects");
  const locale = useLocale() as Locale;

  const kindLine = ({ kind, farmType, floors, businessType }: KindFields) => {
    const detail =
      kind === "FARM" && farmType
        ? t(`farmType.${farmType}`)
        : kind === "BUILDING" && floors
          ? t("floors", { count: locale === "bn" ? localDigits(floors, locale) : floors })
          : kind === "BUSINESS"
            ? businessType
            : null;
    return detail ? `${t(`kind.${kind}`)} · ${detail}` : t(`kind.${kind}`);
  };

  return { t, kindLine };
}
