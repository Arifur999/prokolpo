import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { BudgetHero } from "@/components/modules/Overview/BudgetHero";
import { CategorySpend } from "@/components/modules/Overview/CategorySpend";
import { KeyFigures } from "@/components/modules/Overview/KeyFigures";
import { MobileOverviewHeader } from "@/components/modules/Overview/MobileOverviewHeader";
import { MonthlySpend } from "@/components/modules/Overview/MonthlySpend";
import { Panel, PanelEmpty } from "@/components/modules/Overview/Panel";
import { PhaseBudgets } from "@/components/modules/Overview/PhaseBudgets";
import { QuickActions } from "@/components/modules/Overview/QuickActions";
import { Icon } from "@/components/shared/icon/Icon";
import { ToastOnMount } from "@/components/shared/ToastOnMount";
import type { Locale } from "@/i18n/config";
import { dayPart, formatDate, formatWeekdayDate } from "@/lib/dhakaTime";
import { initials } from "@/lib/initials";
import { monthName, monthRange, recentMonths } from "@/lib/months";
import { overviewFeatures, overviewFigures, topCategories } from "@/lib/overview";
import { projectNav } from "@/lib/projectNav";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getUserInfo } from "@/services/auth.services";
import { getOverview } from "@/services/books.services";
import { RecentEntries } from "@/components/modules/Overview/RecentEntries";
import { loadProject } from "./loadProject";

export async function generateMetadata({ params }: PageProps<"/projects/[projectId]">): Promise<Metadata> {
  const project = await loadProject((await params).projectId);
  return { title: `${(await getTranslations("Overview"))("title")} — ${project?.name ?? ""}` };
}

// Boards Main, MainEn and Mobile: the project at a glance.
export default async function OverviewPage({ params, searchParams }: PageProps<"/projects/[projectId]">) {
  const [{ projectId }, { created }] = await Promise.all([params, searchParams]);
  const [project, user, t, locale, common, books] = await Promise.all([
    loadProject(projectId),
    getUserInfo(),
    getTranslations("Overview"),
    getLocale() as Promise<Locale>,
    getTranslations("Common"),
    getOverview(projectId).then((response) => response.data),
  ]);
  if (!project || !user) notFound();

  const now = new Date();
  const features = overviewFeatures(project);
  const salesGroup = projectNav(project).find((group) => group.key === "joint" || group.key === "sales");
  const salesPage = salesGroup?.items.find((item) => item.key !== "partners")?.page ?? null;
  const months = recentMonths(now, 12);
  const greeting = t(`greeting.${dayPart(now)}`, { name: user.name });

  return (
    <>
      {created !== undefined && <ToastOnMount message={(await getTranslations("NewProject"))("created", { name: project.name })} />}
      <MobileOverviewHeader project={project} initials={initials(user.firstName, user.lastName)} logoMark={common("logoMark")} />
      <h1 className="sr-only lg:hidden">{t("title")}</h1>

      <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:px-10 lg:pt-7 lg:pb-10">
        <header className="hidden items-end justify-between gap-6 lg:flex">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-ink-2">{project.name}</span>
            <h1 className="m-0 text-[28px] leading-[1.3] font-semibold">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="box-border flex h-11 items-center gap-2 rounded-lg border border-line-2 bg-white px-3.5 text-sm text-ink-2">
              <Icon name="calendar" size={18} />
              {formatWeekdayDate(now, locale)}
            </span>
            <Link
              href={projectHref(project.id, "reports")}
              className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink no-underline hover:text-ink"
            >
              <Icon name="download" size={18} />
              {t("downloadReport")}
            </Link>
          </div>
        </header>

        <BudgetHero project={project} greeting={greeting} startedOn={formatDate(new Date(project.startDate))} />
        <QuickActions projectId={project.id} features={features} salesPage={salesPage} />
        <KeyFigures figures={overviewFigures(books.figures)} features={features} accountCount={project.accountCount} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <MonthlySpend months={months.map((month) => ({ label: monthName(month, locale), amount: 0 }))} range={monthRange(months.slice(-6), locale)} />
          <CategorySpend
            rows={topCategories(books.categories, t("byCategory.labour"), (count) => t("byCategory.rest", { count }))}
            total={project.spent}
            allHref={projectHref(project.id, "reports")}
          />
        </div>

        <div className="grid grow grid-cols-1 gap-5 lg:grid-cols-4">
          <RecentEntries projectId={project.id} entries={books.recent} />
          <PhaseBudgets phases={project.phases} byFloor={project.kind === "BUILDING"} className={cn(!features.installments && "lg:col-span-2")} />
          {features.installments && (
            <Panel title={t("overdue.title")} className="gap-2 lg:px-5">
              <PanelEmpty>{t("overdue.empty")}</PanelEmpty>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
