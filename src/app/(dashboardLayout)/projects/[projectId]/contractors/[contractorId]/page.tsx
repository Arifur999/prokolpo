import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ContractorActions } from "@/components/modules/Contractors/ContractorActions";
import { ContractorLedgerTable } from "@/components/modules/Contractors/ContractorLedgerTable";
import { ContractorSidePanels } from "@/components/modules/Contractors/ContractorSidePanels";
import { Icon } from "@/components/shared/icon/Icon";
import { sumWages, weekDates, weekStart } from "@/lib/attendance";
import { dhakaToday } from "@/lib/dhakaTime";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getAccounts, getContractor } from "@/services/books.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Contractors"))("title") };
}

type Card = { label: string; value: string; note: string; bar?: number; tone?: "gold" };

// Boards ContractorLedger (daily team) and ContractorLedgerContract.
export default async function ContractorLedgerPage({ params }: PageProps<"/projects/[projectId]/contractors/[contractorId]">) {
  const { projectId, contractorId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const detail = await getContractor(projectId, contractorId).then(
    (response) => response.data,
    () => null,
  );
  if (!detail) notFound();

  const [t, tc, accounts] = await Promise.all([getTranslations("ContractorLedger"), getTranslations("Contractors"), getAccounts(projectId)]);
  const { contractor: c, lines, days } = detail;
  const daily = c.payType === "DAILY";
  const today = dhakaToday();
  const thisWeek = weekStart(today);
  const thisWeekDays = new Set(weekDates(thisWeek));
  const weekWages = sumWages(days.filter((d) => thisWeekDays.has(d.day)));
  const weeks = lines.filter((l) => l.kind === "WEEK").length;
  const paidPercent = c.total ? Math.round((c.paid / c.total) * 100) : 0;
  const lastPay = c.lastPayDate ? dayFirst(c.lastPayDate.slice(0, 10)) : null;
  const extraCount = lines.filter((l) => l.kind === "EXTRA").length;

  const cards: Card[] = [
    daily
      ? { label: t("wagesTotal"), value: `৳ ${formatAmount(c.wages)}`, note: t("wagesNote", { days: c.manDays }) }
      : {
          label: t("contractTotal"),
          value: `৳ ${formatAmount((c.contractAmount ?? 0) + c.extras)}`,
          note: c.extras ? t("contractNote", { contract: formatAmount(c.contractAmount ?? 0), extra: formatAmount(c.extras) }) : t("contractOnly"),
        },
    { label: t("paid"), value: `৳ ${formatAmount(c.paid)}`, note: t("paidNote", { percent: paidPercent }), bar: paidPercent },
    {
      label: t("due"),
      value: c.due < 0 ? t("advance", { amount: formatAmount(-c.due) }) : `৳ ${formatAmount(c.due)}`,
      note: lastPay ? t("dueNote", { date: lastPay }) : t("dueNoPayment"),
      tone: "gold",
    },
    daily
      ? { label: t("weekly"), value: `৳ ${formatAmount(weeks ? Math.round(c.wages / weeks) : 0)}`, note: t("weeklyNote", { weeks }) }
      : { label: t("extras"), value: `৳ ${formatAmount(c.extras)}`, note: t("extrasNote", { count: extraCount }) },
  ];

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <div className="flex flex-col gap-4">
        <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "contractors")} className="text-ink-2 no-underline hover:text-ink">
            {t("breadcrumb")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {c.name}
          </span>
        </nav>
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <Icon name="hardHat" size={26} />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="m-0 flex flex-wrap items-center gap-3 text-2xl leading-[1.3] font-semibold lg:text-[28px]">
                {c.name}
                <span className="rounded-full bg-brand-tint px-2.5 py-px text-sm font-bold text-success">{tc(`status.${c.status}`)}</span>
              </h1>
              <p className="m-0 flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm text-ink-2">
                {c.phone && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="phone" size={15} strokeWidth={2} />
                    {displayPhone(c.phone)}
                  </span>
                )}
                <span>{c.work}</span>
                <span className="rounded-full bg-surface-4 px-2.25 text-[13px] font-semibold text-ink-2">
                  {daily ? t("payDaily", { amount: formatAmount(c.dailyWage ?? 0) }) : t("payContract")}
                </span>
              </p>
            </div>
          </div>
          <ContractorActions
            projectId={projectId}
            contractor={c}
            accounts={accounts.data.map(({ id, name, balance }) => ({ id, name, balance }))}
            weekWages={weekWages}
            canWrite={project.role !== "VIEWER"}
          />
        </header>
      </div>

      <section aria-label={t("summary")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {cards.map((card) => (
          <article
            key={card.label}
            className={cn(
              "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5",
              card.tone === "gold" ? "border-gold-line bg-gold-wash" : "border-line-2 bg-white",
            )}
          >
            <h2 className={cn("m-0 text-sm", card.tone === "gold" ? "font-semibold text-gold-deep" : "font-medium text-ink-2")}>{card.label}</h2>
            <p className="m-0 text-[22px] leading-[1.2] font-bold lg:text-[26px]">{card.value}</p>
            {card.bar !== undefined && (
              <span role="img" aria-label={t("paidAria", { percent: card.bar })} className="h-1.5 overflow-hidden rounded-full bg-line-3">
                <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, card.bar)}%` }} />
              </span>
            )}
            <p className="m-0 text-[13px] text-ink-3">{card.note}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-5.5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <ContractorLedgerTable lines={lines} days={days} daily={daily} today={today} />
        <div className="flex flex-col gap-4.5">
          <ContractorSidePanels projectId={projectId} contractor={c} days={days} weekStart={thisWeek} today={today} />
        </div>
      </div>
    </div>
  );
}
