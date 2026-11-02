import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ContractorList } from "@/components/modules/Contractors/ContractorList";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { OpenNewButton } from "@/components/shared/OpenNewButton";
import { Icon } from "@/components/shared/icon/Icon";
import { StatCard } from "@/components/shared/StatCard";
import type { Locale } from "@/i18n/config";
import { dhakaToday, formatWeekdayDate } from "@/lib/dhakaTime";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { getAccounts, getAttendance, getContractors } from "@/services/books.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Contractors"))("title") };
}

// The wage of one team-day: everyone at its rate, half of it on a half day.
const dayWage = (d: { headcount: number; rate: number; halfDay: boolean }) => Math.floor((d.headcount * d.rate) / (d.halfDay ? 2 : 1));

// Boards ContractorList, ContractorAdd and ContractorPay.
export default async function ContractorsPage({ params }: PageProps<"/projects/[projectId]/contractors">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();

  const [t, locale, contractors, accounts, week] = await Promise.all([
    getTranslations("Contractors"),
    getLocale() as Promise<Locale>,
    getContractors(projectId),
    getAccounts(projectId),
    getAttendance(projectId),
  ]);
  const list = contractors.data;
  const owing = list.filter((c) => c.due > 0);
  const contracts = list.filter((c) => c.payType === "CONTRACT");
  const teams = list.filter((c) => c.payType === "DAILY");
  const today = dhakaToday();
  const todayDays = week.data.teams.flatMap((team) => team.days.filter((d) => d.day === today));
  const canWrite = project.role !== "VIEWER";

  return (
    <div className="flex grow flex-col gap-6 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ProjectPageHeader
        projectName={project.name}
        title={t("title")}
        actions={
          <>
            <Link
              href={projectHref(projectId, "contractors/attendance")}
              className="box-border flex h-11 items-center gap-2 rounded-lg border border-brand bg-white px-4 text-[15px] font-semibold text-brand no-underline hover:text-brand"
            >
              <Icon name="calendarTick" size={18} />
              {t("attendance")}
            </Link>
            {canWrite && <OpenNewButton label={t("add")} />}
          </>
        }
      />

      <section aria-label={t("summaryLabel")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <article className="flex flex-col gap-1.5 rounded-2xl border border-gold-line bg-gold-wash px-5 py-4.5">
          <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("totalDue")}</h2>
          <p className="m-0 text-[22px] leading-[1.2] font-bold lg:text-[26px]">৳ {formatAmount(owing.reduce((sum, c) => sum + c.due, 0))}</p>
          <p className="m-0 text-[13px] text-ink-2">{t("totalDueNote", { count: list.length, due: owing.length })}</p>
        </article>
        <StatCard
          title={t("contracts")}
          value={`৳ ${formatAmount(contracts.reduce((sum, c) => sum + (c.contractAmount ?? 0) + c.extras, 0))}`}
          note={t("contractsNote", { count: contracts.length })}
        />
        <StatCard
          title={t("monthWages")}
          value={`৳ ${formatAmount(teams.reduce((sum, c) => sum + c.wages, 0))}`}
          note={t("monthWagesNote", { teams: teams.length, days: teams.reduce((sum, c) => sum + c.manDays, 0) })}
        />
        <article className="flex flex-col gap-2.5 rounded-2xl bg-brand px-5 py-4.5 text-white">
          <h2 className="m-0 flex items-center gap-2 text-sm font-semibold text-white/85">
            <Icon name="calendar" size={16} strokeWidth={2} />
            {t("today", { date: formatWeekdayDate(new Date(), locale) })}
          </h2>
          <p className="m-0 text-base leading-[1.4] font-semibold">
            {!teams.length
              ? t("todayNoTeams")
              : todayDays.length
                ? t("todayDone", {
                    people: todayDays.reduce((sum, d) => sum + d.headcount, 0),
                    amount: formatAmount(todayDays.reduce((sum, d) => sum + dayWage(d), 0)),
                  })
                : t("todayMissing")}
          </p>
          {teams.length > 0 && (
            <Link
              href={projectHref(projectId, "contractors/attendance")}
              className="box-border flex h-9 items-center gap-1.5 self-start rounded-[9px] bg-gold px-3.5 text-sm font-bold text-brand no-underline hover:text-brand"
            >
              {t("markAttendance")}
              <Icon name="arrowRight" size={16} strokeWidth={2.2} />
            </Link>
          )}
        </article>
      </section>

      <ContractorList
        projectId={projectId}
        contractors={list}
        accounts={accounts.data.map(({ id, name, balance }) => ({ id, name, balance }))}
        canWrite={canWrite}
      />
    </div>
  );
}
