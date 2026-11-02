import Link from "next/link";
import { useTranslations } from "next-intl";
import { FRIDAY, manDays, manDaysText, sumManDays, sumWages, weekDates } from "@/lib/attendance";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IAttendanceDay, IContractor } from "@/types/books.types";

type ContractorSidePanelsProps = {
  projectId: string;
  contractor: IContractor;
  days: IAttendanceDay[];
  weekStart: string;
  today: string;
};

function Panel({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2.5 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
      <h2 id={id} className="m-0 text-base font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Facts({ rows }: { rows: [string, string | null | undefined, boolean?][] }) {
  return (
    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
      {rows
        .filter(([, value]) => value)
        .map(([label, value, strong]) => (
          <div key={label} className="contents">
            <dt className="text-ink-3">{label}</dt>
            <dd className={cn("m-0 text-right", strong && "font-semibold")}>{value}</dd>
          </div>
        ))}
    </dl>
  );
}

// The right-hand column of a contractor's ledger: this week and the team for a daily team,
// the terms for a contract (boards ContractorLedger, ContractorLedgerContract).
export function ContractorSidePanels({ projectId, contractor: c, days, weekStart, today }: ContractorSidePanelsProps) {
  const t = useTranslations("ContractorLedger");

  if (c.payType === "CONTRACT") {
    return (
      <Panel id="terms-title" title={t("terms")}>
        <Facts
          rows={[
            [t("amount"), `৳ ${formatAmount(c.contractAmount ?? 0)}`, true],
            [t("scope"), c.scope ?? c.work],
            [t("phone"), c.phone && displayPhone(c.phone)],
          ]}
        />
      </Panel>
    );
  }

  const dates = weekDates(weekStart);
  const byDay = new Map(days.map((d) => [d.day, d]));
  const week = dates.map((iso) => byDay.get(iso)).filter((d): d is IAttendanceDay => Boolean(d));
  const workedToday = byDay.has(today);
  const firstDay = days[0]?.day;

  return (
    <>
      <Panel id="wk-title" title={t("thisWeek")}>
        <span className="-mt-2 text-[13px] text-ink-3">
          {t("thisWeekSub", {
            range: `${dayFirst(dates[0]!).slice(0, 5)} – ${dayFirst(dates[6]!).slice(0, 5)}`,
            state: workedToday ? t("todayDone") : t("todayMissing"),
          })}
        </span>
        <div className="grid grid-cols-7 gap-1.25">
          {dates.map((iso, i) => {
            const d = byDay.get(iso);
            return (
              <span
                key={iso}
                className={cn(
                  "flex flex-col items-center rounded-[9px] py-1.5",
                  d ? "bg-brand-tint text-brand" : "bg-surface-4 text-ink-3",
                  iso === today && "shadow-[0_0_0_2px_var(--color-gold)]",
                )}
              >
                <span className="text-[11px]">{t(`weekdays.${String(i) as "0"}`)}</span>
                <strong className="text-[15px] font-bold">{d ? manDaysText(manDays(d)) : i === FRIDAY ? t("holiday") : "—"}</strong>
              </span>
            );
          })}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-2">{t("weekMath", { days: manDaysText(sumManDays(week)), rate: formatAmount(c.dailyWage ?? 0) })}</span>
          <strong className="font-bold">৳ {formatAmount(sumWages(week))}</strong>
        </div>
        <Link
          href={projectHref(projectId, "contractors/attendance")}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-brand text-sm font-semibold text-brand no-underline hover:text-brand"
        >
          {t("markToday")}
        </Link>
      </Panel>
      <Panel id="tm-title" title={t("teamInfo")}>
        <Facts
          rows={[
            [t("team"), t("teamValue", { count: c.teamSize ?? 1, work: c.work })],
            [t("wage"), t("wageValue", { amount: formatAmount(c.dailyWage ?? 0) }), true],
            [t("started"), firstDay ? dayFirst(firstDay) : t("notYet")],
            [t("phone"), c.phone && displayPhone(c.phone)],
          ]}
        />
        <p className="m-0 rounded-lg bg-surface-2 px-2.5 py-2 text-xs leading-[1.55] text-ink-2">{t("rateNote")}</p>
      </Panel>
    </>
  );
}
