import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ActivitySide } from "@/components/modules/Activity/ActivitySide";
import { ActivityTimeline } from "@/components/modules/Activity/ActivityTimeline";
import { PeriodFilter } from "@/components/modules/Activity/PeriodFilter";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { isActivityPeriod } from "@/lib/activityGroups";
import { dhakaToday } from "@/lib/dhakaTime";
import { getActivity, getActivityWeek, getTeam } from "@/services/members.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Activity"))("title") };
}

// Board Activity: who added, changed or deleted what, filtered by person, kind and period.
export default async function ActivityPage({ params, searchParams }: PageProps<"/projects/[projectId]/activity">) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(projectId);
  if (!project) notFound();

  const pick = (key: string) => (typeof query[key] === "string" ? (query[key] as string) : "");
  const days = pick("days");
  const period = isActivityPeriod(days) ? days : "7";
  const filters: Record<string, string> = {};
  if (pick("actor")) filters.actor = pick("actor");
  if (pick("action")) filters.action = pick("action");
  if (period !== "all") filters.days = period;

  const [t, items, week, team] = await Promise.all([
    getTranslations("Activity"),
    getActivity(projectId, filters),
    getActivityWeek(projectId),
    getTeam(projectId),
  ]);
  const today = dhakaToday();

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ProjectPageHeader projectName={project.name} title={t("title")} subtitle={t("subtitle")} actions={<PeriodFilter period={period} today={today} />} />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ActivityTimeline
          key={JSON.stringify(filters)}
          projectId={projectId}
          items={items.data}
          filters={filters}
          people={team.data.members}
          canWrite={project.role !== "VIEWER"}
        />
        <ActivitySide week={week.data} today={today} />
      </div>
    </div>
  );
}
