"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAttendanceAction } from "@/app/(dashboardLayout)/projects/[projectId]/contractors/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { FRIDAY, manDaysText, weekDates } from "@/lib/attendance";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, toLatinDigits } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ITeamWeek } from "@/types/books.types";

type Cell = { headcount: number; halfDay: boolean };
type Cells = Record<string, Cell>;

type AttendanceGridProps = {
  projectId: string;
  weekStart: string;
  today: string;
  teams: ITeamWeek[];
};

const GRID = "grid-cols-[minmax(180px,1fr)_repeat(7,82px)_84px_120px]";
const key = (team: string, day: string) => `${team}|${day}`;
const md = (c: Cell | undefined) => (c ? c.headcount * (c.halfDay ? 0.5 : 1) : 0);
const wage = (c: Cell | undefined, rate: number) => (c ? Math.floor((c.headcount * rate) / (c.halfDay ? 2 : 1)) : 0);
const same = (a: Cell | undefined, b: Cell | undefined) => (a?.headcount ?? 0) === (b?.headcount ?? 0) && (a?.halfDay ?? false) === (b?.halfDay ?? false);

const fromTeams = (teams: ITeamWeek[]): Cells =>
  Object.fromEntries(teams.flatMap((team) => team.days.map((d) => [key(team.contractorId, d.day), { headcount: d.headcount, halfDay: d.halfDay }])));

// Board Attendance: one row per daily team, one column per day of the week. A typed number
// is how many worked; ½ marks the whole team on a half day. Wages follow on their own.
export function AttendanceGrid({ projectId, weekStart, today, teams }: AttendanceGridProps) {
  const t = useTranslations("Attendance");
  const tw = useTranslations("ContractorLedger.weekdays");
  const router = useRouter();
  const [saved, setSaved] = useState<Cells>(() => fromTeams(teams));
  const [cells, setCells] = useState<Cells>(saved);
  const [isPending, startTransition] = useTransition();
  const dates = weekDates(weekStart);

  const set = (team: string, day: string, patch: Partial<Cell>) =>
    setCells((all) => {
      const current = all[key(team, day)] ?? { headcount: 0, halfDay: false };
      return { ...all, [key(team, day)]: { ...current, ...patch } };
    });

  const changed = teams.flatMap((team) =>
    dates.filter((day) => !same(cells[key(team.contractorId, day)], saved[key(team.contractorId, day)])).map((day) => ({ team, day })),
  );

  // Copies the last day someone worked into today, team by team.
  const copyLastDay = () =>
    teams.forEach((team) => {
      const last = [...dates].filter((day) => day < today && cells[key(team.contractorId, day)]?.headcount).pop();
      if (last && dates.includes(today)) set(team.contractorId, today, { ...cells[key(team.contractorId, last)]! });
    });

  const save = () =>
    startTransition(async () => {
      const payload = changed.map(({ team, day }) => {
        const c = cells[key(team.contractorId, day)];
        return { contractorId: team.contractorId, day, headcount: c?.headcount ?? 0, halfDay: c?.halfDay ?? false };
      });
      const result = await saveAttendanceAction(projectId, payload);
      if (!result.success) return void toast.error(result.message);
      setSaved(cells);
      const todayCells = teams.map((team) => ({ c: cells[key(team.contractorId, today)], rate: team.dailyWage })).filter(({ c }) => c?.headcount);
      toast.success(
        todayCells.length
          ? t("saved", {
              people: todayCells.reduce((sum, { c }) => sum + (c?.headcount ?? 0), 0),
              amount: formatAmount(todayCells.reduce((sum, { c, rate }) => sum + wage(c, rate), 0)),
            })
          : t("savedPlain"),
      );
      router.refresh();
    });

  if (!teams.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line-strong px-6 py-14 text-center">
        <span className="text-[17px] font-semibold">{t("noTeamsTitle")}</span>
        <span className="text-sm text-ink-3">{t("noTeamsBody")}</span>
        <Link href={projectHref(projectId, "contractors?new=1")} className="mt-2 text-sm font-semibold no-underline">
          {t("addTeam")}
        </Link>
      </div>
    );
  }

  const rowTotals = teams.map((team) => dates.reduce((sum, day) => sum + md(cells[key(team.contractorId, day)]), 0));
  const rowWages = teams.map((team) => dates.reduce((sum, day) => sum + wage(cells[key(team.contractorId, day)], team.dailyWage), 0));
  const totalDays = rowTotals.reduce((a, b) => a + b, 0);
  const totalWages = rowWages.reduce((a, b) => a + b, 0);
  const todayPeople = teams.reduce((sum, team) => sum + (cells[key(team.contractorId, today)]?.headcount ?? 0), 0);
  const todayWages = teams.reduce((sum, team) => sum + wage(cells[key(team.contractorId, today)], team.dailyWage), 0);
  const dayBg = (day: string, i: number) => (day === today ? "bg-gold-wash" : i === FRIDAY ? "bg-surface-2" : "");

  return (
    <>
      <section aria-label={t("gridLabel")} className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-2 px-5 py-3.5">
          <p className="m-0 flex flex-wrap items-center gap-3.5 text-sm text-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="flex h-5.5 w-6.5 items-center justify-center rounded-md border border-line text-[13px] font-semibold text-ink">6</span>
              {t("legendFull")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded-md bg-gold-tint px-1.5 text-[13px] font-bold text-gold-ink">½</span>
              {t("legendHalf")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="box-border size-5.5 rounded-md border-[1.5px] border-gold-strong" />
              {t("legendDirty")}
            </span>
          </p>
          <button
            type="button"
            onClick={copyLastDay}
            className="flex h-9.5 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-semibold text-ink"
          >
            <Icon name="undo" size={16} strokeWidth={2} />
            {t("copyLast")}
          </button>
        </div>

        <div role="table" aria-label={t("tableLabel")} className="overflow-x-auto">
          <div className="min-w-230">
            <div role="row" className={cn("grid items-stretch border-b border-line-2 bg-surface-2 text-[13px] text-ink-2", GRID)}>
              <span role="columnheader" className="flex items-center px-5 font-semibold">
                {t("team")}
              </span>
              {dates.map((day, i) => (
                <span key={day} role="columnheader" className={cn("flex flex-col items-center justify-center gap-px py-2", day === today && "bg-gold-tint")}>
                  <span className="font-semibold text-ink">{tw(String(i) as "0")}</span>
                  <span>{dayFirst(day).slice(0, 5)}</span>
                  {(day === today || i === FRIDAY) && (
                    <span className={cn("rounded-md px-1.5 text-xs font-bold", day === today ? "bg-gold text-brand" : "bg-canvas-deep text-ink-2")}>
                      {day === today ? t("today") : t("holiday")}
                    </span>
                  )}
                </span>
              ))}
              <span role="columnheader" className="flex items-center justify-end pr-3 font-semibold">
                {t("manDays")}
              </span>
              <span role="columnheader" className="flex items-center justify-end pr-5 font-semibold">
                {t("wages")}
              </span>
            </div>

            {teams.map((team, row) => (
              <div key={team.contractorId} role="row" className={cn("grid items-stretch border-b border-line-3", GRID)}>
                <span role="rowheader" className="flex items-center gap-3 px-5 py-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-gold-tint text-[15px] font-bold text-gold-ink"
                  >
                    {Array.from(team.name)[0]}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-semibold">{team.name}</span>
                    <span className="text-[13px] text-ink-3">{t("teamSub", { work: team.work, rate: formatAmount(team.dailyWage) })}</span>
                  </span>
                </span>
                {dates.map((day, i) => {
                  const c = cells[key(team.contractorId, day)];
                  const dirty = !same(c, saved[key(team.contractorId, day)]);
                  const label = tw(String(i) as "0");
                  return (
                    <span key={day} role="cell" className={cn("flex flex-col items-center justify-center gap-1 py-2.5", dayBg(day, i))}>
                      <input
                        inputMode="numeric"
                        aria-label={t("cellLabel", { team: team.name, day: label, date: dayFirst(day).slice(0, 5) })}
                        placeholder="–"
                        value={c?.headcount ? String(c.headcount) : ""}
                        onChange={(event) =>
                          set(team.contractorId, day, { headcount: Math.min(99, Number(toLatinDigits(event.target.value).slice(0, 2) || 0)) })
                        }
                        className={cn(
                          "box-border h-9.5 w-13 rounded-[9px] bg-white p-0 text-center text-[17px] font-semibold text-ink outline-none focus:shadow-focus",
                          dirty ? "border-[1.5px] border-gold-strong" : "border border-line",
                        )}
                      />
                      <button
                        type="button"
                        aria-pressed={c?.halfDay ?? false}
                        aria-label={t("halfLabel", { team: team.name, day: label })}
                        onClick={() => set(team.contractorId, day, { halfDay: !(c?.halfDay ?? false) })}
                        className={cn(
                          "h-5.5 cursor-pointer rounded-md border-none px-2 text-xs font-bold",
                          c?.halfDay ? "bg-gold-tint text-gold-ink" : "bg-transparent text-ink-5",
                        )}
                      >
                        {t("half")}
                      </button>
                    </span>
                  );
                })}
                <span role="cell" className="flex items-center justify-end pr-3 text-[15px] font-semibold">
                  {manDaysText(rowTotals[row]!)}
                </span>
                <span role="cell" className="flex flex-col items-end justify-center pr-5">
                  <span className="text-base font-bold">{formatAmount(rowWages[row]!)}</span>
                  <span className="text-xs text-ink-3">{t("rateMath", { days: manDaysText(rowTotals[row]!), rate: formatAmount(team.dailyWage) })}</span>
                </span>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-2 border-b border-line-3 px-5 py-3">
              <Link href={projectHref(projectId, "contractors?new=1")} className="flex items-center gap-1.5 text-sm font-semibold no-underline">
                <Icon name="plus" size={15} strokeWidth={2.2} />
                {t("addTeam")}
              </Link>
              <span className="text-[13px] text-ink-3">{t("addTeamNote")}</span>
            </div>

            <div role="row" className={cn("grid items-stretch bg-surface-2 text-[13px]", GRID)}>
              <span role="rowheader" className="flex items-center px-5 py-3 text-sm font-semibold">
                {t("dayTotal")}
              </span>
              {dates.map((day, i) => {
                const dayMd = teams.reduce((sum, team) => sum + md(cells[key(team.contractorId, day)]), 0);
                const dayWages = teams.reduce((sum, team) => sum + wage(cells[key(team.contractorId, day)], team.dailyWage), 0);
                return (
                  <span key={day} role="cell" className={cn("flex flex-col items-center justify-center py-2", dayBg(day, i))}>
                    <span className="text-[15px] font-bold text-ink">{dayMd ? manDaysText(dayMd) : "–"}</span>
                    <span className="text-ink-3">{dayWages ? `৳ ${formatAmount(dayWages)}` : i === FRIDAY ? t("holiday") : ""}</span>
                  </span>
                );
              })}
              <span role="cell" className="flex items-center justify-end pr-3 text-[15px] font-bold">
                {manDaysText(totalDays)}
              </span>
              <span role="cell" className="flex items-center justify-end pr-5 text-[17px] font-bold">
                ৳ {formatAmount(totalWages)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={t("impactLabel")} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_1.4fr] md:gap-5">
        <article className="flex flex-col gap-1.5 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("weekTotal")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(totalWages)}</p>
          <p className="m-0 text-[13px] text-ink-3">{t("weekTotalNote", { days: manDaysText(totalDays), teams: teams.length })}</p>
        </article>
        <article
          className={cn("flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5", todayPeople ? "border-line-2 bg-white" : "border-gold-line bg-gold-wash")}
        >
          <h2 className={cn("m-0 text-sm font-semibold", todayPeople ? "text-ink-2" : "text-gold-deep")}>
            {t("todayTitle", { date: dayFirst(today).slice(0, 5) })}
          </h2>
          <p className="m-0 text-[22px] leading-[1.3] font-semibold">
            {todayPeople ? t("todayValue", { people: todayPeople, amount: formatAmount(todayWages) }) : t("todayEmpty")}
          </p>
          <p className="m-0 text-[13px] text-ink-2">{t("todayNote")}</p>
        </article>
        <article className="flex flex-col gap-2 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("dueAfter")}</h2>
          {teams.map((team) => {
            const before = dates.reduce((sum, day) => sum + wage(saved[key(team.contractorId, day)], team.dailyWage), 0);
            const after = team.due + rowWages[teams.indexOf(team)]! - before;
            return (
              <div key={team.contractorId} className="flex items-center gap-2.5 text-sm">
                <span className="grow truncate font-semibold">{team.name}</span>
                <span className="text-ink-3">৳ {formatAmount(team.due)}</span>
                <Icon name="arrowRight" size={14} strokeWidth={2} className="text-ink-3" />
                <strong className={cn("min-w-23 text-right font-bold", after !== team.due && "text-gold-ink")}>৳ {formatAmount(after)}</strong>
              </div>
            );
          })}
        </article>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line-2 bg-white px-5 py-3.5">
        <span className={cn("flex items-center gap-2 text-sm font-semibold", changed.length ? "text-gold-ink" : "text-success")}>
          <span aria-hidden="true" className={cn("size-2 rounded-full", changed.length ? "bg-gold-strong" : "bg-brand-mid")} />
          {changed.length ? t("dirty", { count: changed.length }) : t("clean")}
        </span>
        <div className="flex gap-2.5">
          <Link
            href={projectHref(projectId, "contractors")}
            className="box-border flex h-11.5 items-center rounded-xl border border-line bg-white px-4.5 text-[15px] font-semibold text-ink no-underline hover:text-ink"
          >
            {t("back")}
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={!changed.length || isPending}
            aria-busy={isPending}
            className={cn(
              "flex h-11.5 cursor-pointer items-center gap-2 rounded-xl border-none px-5.5 text-[15px] font-semibold text-white disabled:cursor-default",
              changed.length ? "bg-brand" : "bg-brand-soft",
            )}
          >
            <Icon name={isPending ? "spinner" : "check"} size={18} strokeWidth={2.4} className={isPending ? "animate-spin" : undefined} />
            {t("save")}
          </button>
        </div>
      </div>
    </>
  );
}
