"use client";

import { useLocale, useMessages, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { ordinal } from "@/lib/digits";
import type { PlanCopy } from "@/lib/projectPlan";

// The plan's lists and names in the reader's language, from ProjectTemplates.
export function usePlanCopy(): PlanCopy {
  const locale = useLocale() as Locale;
  const t = useTranslations("ProjectTemplates.phases");
  const { categories, phases } = useMessages().ProjectTemplates;

  return {
    categories,
    buildingStart: phases.buildingStart,
    buildingEnd: phases.buildingEnd,
    farmSetup: phases.farmSetup,
    fixedPhases: { LAND: phases.LAND, BUSINESS: phases.BUSINESS, RENOVATION: phases.RENOVATION },
    floorName: (n) => t("floor", { ordinal: ordinal(n, locale) }),
    cycleName: (farmType, n) => t(farmType === "CROP" ? "season" : "batch", { ordinal: ordinal(n, locale), n }),
  };
}
