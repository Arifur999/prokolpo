"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { ExcelButton } from "@/components/shared/ExcelButton";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import type { Sheet } from "@/lib/excel";
import { collectionReport } from "@/lib/reportCollection";
import { duesReport } from "@/lib/reportDues";
import { profitReport, type Scenario } from "@/lib/reportProfit";
import type { IAccount, IContractor, IExpenseReport, ISupplier } from "@/types/books.types";
import type { IPartner } from "@/types/partners.types";
import type { ISale, IUnit } from "@/types/sales.types";
import { CollectionReport } from "./collection/CollectionReport";
import { DuesReport } from "./dues/DuesReport";
import type { ExpenseGroup } from "./expense/buildExpenseLines";
import { ExpenseReport, type ExpensePeriod } from "./expense/ExpenseReport";
import { ProfitReport } from "./profit/ProfitReport";
import { collectionSheet, duesSheet, expenseSheet, profitSheet } from "./reportSheets";
import { ReportNav, type ReportKind } from "./ReportNav";

export type ReportData =
  | { kind: "EXPENSE"; report: IExpenseReport; group: ExpenseGroup; period: ExpensePeriod; lastMonth: string }
  | { kind: "COLLECTION"; sales: ISale[] }
  | { kind: "PROFIT"; sales: ISale[]; units: IUnit[]; partners: IPartner[]; spent: number; budget: number | null; startDate: string }
  | { kind: "DUES"; sales: ISale[] | null; partners: IPartner[] | null; suppliers: ISupplier[]; contractors: IContractor[]; accounts: IAccount[] };

type ReportsViewProps = { projectName: string; kinds: ReportKind[]; data: ReportData; today: string };

// The reports page (boards Reports, ReportCollection, ReportProfit): pick a report on the
// left; each saves to Excel or prints on A4.
export function ReportsView({ projectName, kinds, data, today }: ReportsViewProps) {
  const t = useTranslations("Reports");
  const router = useRouter();
  const pathname = usePathname();
  const [scenario, setScenario] = useState<Scenario>("BUDGET");
  const translate = (key: string, values?: Record<string, string | number>) => t(key as Parameters<typeof t>[0], values);
  const href = (params: Record<string, string>) => `${pathname}?${new URLSearchParams(params).toString()}`;

  let body: React.ReactNode;
  let sheet: () => Sheet | Sheet[];
  switch (data.kind) {
    case "EXPENSE": {
      const go = (patch: { group?: ExpenseGroup; period?: ExpensePeriod }) =>
        router.replace(href({ r: "EXPENSE", g: patch.group ?? data.group, p: patch.period ?? data.period }), { scroll: false });
      body = <ExpenseReport report={data.report} group={data.group} period={data.period} lastMonth={data.lastMonth} onChange={go} />;
      sheet = () => expenseSheet(data.report, data.group, translate);
      break;
    }
    case "COLLECTION": {
      const c = collectionReport(data.sales, today);
      body = <CollectionReport report={c} />;
      sheet = () => collectionSheet(c, translate);
      break;
    }
    case "PROFIT": {
      const p = profitReport({ ...data, scenario });
      body = <ProfitReport report={p} scenario={scenario} hasBudget={data.budget !== null} startDate={data.startDate} today={today} onScenario={setScenario} />;
      sheet = () => profitSheet(p, translate);
      break;
    }
    case "DUES": {
      const d = duesReport({ ...data, today });
      body = <DuesReport report={d} cash={data.accounts.reduce((n, a) => n + a.balance, 0)} accountCount={data.accounts.length} />;
      sheet = () => duesSheet(d, translate);
      break;
    }
  }

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <ExcelButton label={t("excel")} done={t("exported")} sheet={sheet} file={`${projectName} - ${t(`kinds.${data.kind}.label`)}`} />
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
            >
              <Icon name="printer" size={18} strokeWidth={2} />
              {t("print")}
            </button>
          </div>
        }
      />
      <p className="m-0 hidden text-[13px] text-ink-3 print:block">{t("printedOn", { date: dayFirst(today) })}</p>
      <div className="grid grid-cols-1 items-start gap-5.5 lg:grid-cols-[224px_minmax(0,1fr)] print:block">
        <ReportNav kinds={kinds} current={data.kind} href={(k) => href({ r: k })} />
        <div className="flex min-w-0 flex-col gap-4.5">{body}</div>
      </div>
    </>
  );
}
