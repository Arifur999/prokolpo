import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { NewSaleForm } from "@/components/modules/Sales/form/NewSaleForm";
import { Icon } from "@/components/shared/icon/Icon";
import { dhakaToday } from "@/lib/dhakaTime";
import { projectHref } from "@/lib/routes";
import { getAccounts } from "@/services/books.services";
import { getCustomers, getUnits } from "@/services/sales.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("SaleNew"))("title") };
}

// Board SaleNew. ?unit= picks the unit, as the units page links it.
export default async function NewSalePage({ params, searchParams }: PageProps<"/projects/[projectId]/sales/new">) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(projectId);
  if (!project) notFound();
  if (project.role === "VIEWER") redirect(projectHref(projectId, "sales"));

  const [t, ts, units, customers, accounts] = await Promise.all([
    getTranslations("SaleNew"),
    getTranslations("Sales"),
    getUnits(projectId),
    getCustomers(projectId),
    getAccounts(projectId),
  ]);
  const free = units.data.filter((u) => !u.sale);
  const owed = units.data.reduce((n, u) => n + Math.max(0, u.sale?.standing.due ?? 0), 0);

  return (
    <div className="flex grow flex-col gap-5.5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <div className="flex flex-col gap-2.5">
        <nav aria-label={ts("title")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "sales")} className="text-ink-2 no-underline">
            {ts("title")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {t("title")}
          </span>
        </nav>
        <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{t("title")}</h1>
      </div>
      <NewSaleForm
        projectId={projectId}
        units={free}
        customers={customers.data}
        accounts={accounts.data}
        today={dhakaToday()}
        unitId={typeof query.unit === "string" ? query.unit : ""}
        owedNow={owed}
      />
    </div>
  );
}
