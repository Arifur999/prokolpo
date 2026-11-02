"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Icon } from "@/components/shared/icon/Icon";
import { ACTIVITY_PERIODS, shiftDay, shortDay, type ActivityPeriod } from "@/lib/activityGroups";
import { dayFirst } from "@/lib/expenseText";

// "গত 7 দিন: 27/09 – 03/10/2026" at the top of the activity page; 7 days is the default.
export function PeriodFilter({ period, today }: { period: ActivityPeriod; today: string }) {
  const t = useTranslations("Activity");
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const label = (value: ActivityPeriod) =>
    value === "all" ? t("period.all") : t(`period.${value}`, { from: shortDay(shiftDay(today, 1 - Number(value))), to: dayFirst(today) });

  const choose = (value: string) => {
    const next = new URLSearchParams(search.toString());
    if (value === "7") next.delete("days");
    else next.set("days", value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <FilterSelect
      label={t("periodLabel")}
      value={period}
      onChange={choose}
      options={ACTIVITY_PERIODS.map((value) => ({ value, label: label(value) }))}
      icon={<Icon name="calendar" size={18} strokeWidth={2} />}
    />
  );
}
