"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Segmented } from "@/components/shared/Segmented";
import { formatAmount } from "@/lib/money";
import { monthName } from "@/lib/months";
import { cn } from "@/lib/utils";
import type { IAdminOverview } from "@/types/admin.types";

type Period = "weeks" | "months";

// "নতুন রেজিস্ট্রেশন" (board AdminDashboard): sign-ups a bar a week (12) or a month (6), the
// current one dark with its count on top.
export function SignupChart({ weeks, months }: Pick<IAdminOverview, "weeks" | "months">) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale() as "bn" | "en";
  const [period, setPeriod] = useState<Period>("weeks");
  const list = period === "weeks" ? weeks : months;
  const label = (start: string) =>
    period === "weeks" ? `${start.slice(8, 10)}/${start.slice(5, 7)}` : monthName(new Date(`${start.slice(0, 7)}-15`), locale, "long");
  const total = list.reduce((n, b) => n + b.count, 0);
  const average = list.length ? Math.round(total / list.length) : 0;
  const top = Math.max(20, Math.ceil(Math.max(...list.map((b) => b.count)) / 20) * 20);
  const last = list.length - 1;
  const sub =
    period === "weeks"
      ? t("weeksSub", { total: formatAmount(total), average, last: list[last]?.count ?? 0 })
      : t("monthsSub", {
          range: `${label(list[0]?.start ?? "")} – ${label(list[last]?.start ?? "")} ${list[last]?.start.slice(0, 4) ?? ""}`,
          total: formatAmount(total),
          average,
        });

  return (
    <section aria-labelledby="ad-signup-title" className="flex flex-col gap-4 rounded-2xl border border-line-2 bg-white px-5.5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col">
          <h2 id="ad-signup-title" className="m-0 text-[17px] font-semibold">
            {t("signups")}
          </h2>
          <span className="text-[13px] text-ink-3">{sub}</span>
        </div>
        <Segmented
          label={t("periodLabel")}
          value={period}
          options={[
            { value: "weeks", label: t("weeks") },
            { value: "months", label: t("months") },
          ]}
          onChange={setPeriod}
          className="bg-surface-4"
        />
      </div>
      <div role="img" aria-label={t("chartAria", { sub })} className="grid h-53.5 grid-cols-[30px_minmax(0,1fr)] gap-2.5">
        <div aria-hidden="true" className="flex flex-col justify-between pb-6.5 text-right text-[11px] leading-none text-ink-5">
          <span>{top}</span>
          <span>{top / 2}</span>
          <span>0</span>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="relative flex grow items-end gap-1.5 border-b border-line sm:gap-2.5">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-dashed border-canvas-deep" />
            <span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-dashed border-canvas-deep" />
            {list.map((b, i) => (
              <div
                key={b.start}
                title={t("barTitle", { label: label(b.start), count: b.count })}
                className="relative flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                {i === last && <span className="text-xs font-bold text-brand">{b.count}</span>}
                <span
                  className={cn("w-full max-w-10 rounded-t-md", i === last ? "bg-brand" : "bg-brand-line")}
                  style={{ height: `${((b.count / top) * 100).toFixed(1)}%` }}
                />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="box-border flex h-6.5 gap-1.5 pt-1.5 sm:gap-2.5">
            {list.map((b, i) => (
              <span key={b.start} className={cn("flex-1 text-center text-[11px] leading-[1.6] whitespace-nowrap", i === last ? "text-ink" : "text-ink-5")}>
                {label(b.start)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
