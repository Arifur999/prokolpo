import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AttendanceGrid } from "@/components/modules/Attendance/AttendanceGrid";
import { Icon } from "@/components/shared/icon/Icon";
import { shiftWeek, weekDates } from "@/lib/attendance";
import { dayFirst } from "@/lib/expenseText";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getAttendance } from "@/services/books.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Attendance"))("title") };
}

// Board Attendance. ?week=YYYY-MM-DD opens any week; the future is out of reach.
export default async function AttendancePage({ params, searchParams }: PageProps<"/projects/[projectId]/contractors/attendance">) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(projectId);
  if (!project) notFound();

  const week = typeof query.week === "string" && /^\d{4}-\d{2}-\d{2}$/.test(query.week) ? query.week : undefined;
  const [t, attendance] = await Promise.all([getTranslations("Attendance"), getAttendance(projectId, week)]);
  const { weekStart, today, teams } = attendance.data;
  const dates = weekDates(weekStart);
  const nextWeek = shiftWeek(weekStart, 1);
  const canGoNext = nextWeek <= today;
  const arrow = "flex size-11 items-center justify-center rounded-lg border bg-white";

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-ink-2">
            <Link href={projectHref(projectId, "contractors")} className="text-ink-2 no-underline hover:text-ink">
              {t("breadcrumb")}
            </Link>
            <Icon name="chevronRight" size={14} strokeWidth={2} />
            <span aria-current="page" className="font-medium text-ink">
              {t("title")}
            </span>
          </nav>
          <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{t("title")}</h1>
          <p className="m-0 text-[15px] text-ink-2">{t("intro")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`?week=${shiftWeek(weekStart, -1)}`} aria-label={t("prevWeek")} className={cn(arrow, "border-line text-ink")}>
            <Icon name="chevronLeft" size={18} strokeWidth={2} />
          </Link>
          <span className="box-border flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold">
            <Icon name="calendar" size={18} />
            {dayFirst(dates[0]!).slice(0, 5)} – {dayFirst(dates[6]!)}
          </span>
          {canGoNext ? (
            <Link href={`?week=${nextWeek}`} aria-label={t("nextWeek")} className={cn(arrow, "border-line text-ink")}>
              <Icon name="chevronRight" size={18} strokeWidth={2} />
            </Link>
          ) : (
            <span aria-label={t("nextWeek")} aria-disabled="true" className={cn(arrow, "border-line-2 text-ink-disabled")}>
              <Icon name="chevronRight" size={18} strokeWidth={2} />
            </span>
          )}
        </div>
      </div>
      <AttendanceGrid key={weekStart} projectId={projectId} weekStart={weekStart} today={today} teams={teams} />
    </div>
  );
}
