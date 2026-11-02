import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { AddSupplierButton } from "@/components/modules/Suppliers/AddSupplierButton";
import { SupplierList } from "@/components/modules/Suppliers/SupplierList";
import { supplierTotals } from "@/components/modules/Suppliers/supplierRules";
import { Icon } from "@/components/shared/icon/Icon";
import { StatCard } from "@/components/shared/StatCard";
import { dhakaToday } from "@/lib/dhakaTime";
import { formatAmount, formatPercent } from "@/lib/money";
import { getAccounts, getSuppliers } from "@/services/books.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Suppliers"))("title") };
}

// Boards SupplierList, SupplierAdd and SupplierPay.
export default async function SuppliersPage({ params }: PageProps<"/projects/[projectId]/suppliers">) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();

  const [t, suppliers, accounts] = await Promise.all([getTranslations("Suppliers"), getSuppliers(projectId), getAccounts(projectId)]);
  const today = dhakaToday();
  const totals = supplierTotals(suppliers.data, today);
  const canWrite = project.role !== "VIEWER";

  return (
    <div className="flex grow flex-col gap-6 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <ProjectPageHeader
        projectName={project.name}
        title={t("title")}
        actions={
          <>
            <button
              type="button"
              className="hidden h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink sm:flex"
            >
              <Icon name="download" size={18} />
              {t("excel")}
            </button>
            {canWrite && <AddSupplierButton label={t("add")} />}
          </>
        }
      />

      <section aria-label={t("summaryLabel")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <article className="flex flex-col gap-1.5 rounded-2xl border border-gold-line bg-gold-wash px-5 py-4.5">
          <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("totalDue")}</h2>
          <p className="m-0 text-[22px] leading-[1.2] font-bold lg:text-[26px]">৳ {formatAmount(totals.due)}</p>
          <p className="m-0 text-[13px] text-ink-2">{t("totalDueNote", { count: suppliers.data.length, due: totals.owingCount })}</p>
        </article>
        <StatCard title={t("billed")} value={`৳ ${formatAmount(totals.billed)}`} note={t("billedNote")} />
        <StatCard
          title={t("paid")}
          value={`৳ ${formatAmount(totals.paid)}`}
          note={
            <span role="img" aria-label={t("paidAria", { percent: formatPercent(totals.paidPercent) })} className="flex items-center gap-2">
              <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
                <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, totals.paidPercent)}%` }} />
              </span>
              {formatPercent(totals.paidPercent)}
            </span>
          }
        />
        <article className="flex flex-col gap-1.5 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("oldest")}</h2>
          {totals.oldest ? (
            <>
              <p className="m-0 truncate text-lg leading-[1.35] font-semibold lg:text-xl">{totals.oldest.supplier.name}</p>
              <p className="m-0 flex items-center gap-1.5 text-[13px] font-semibold text-danger">
                <Icon name="clock" size={14} strokeWidth={2} />
                {t("oldestNote", { amount: formatAmount(totals.oldest.supplier.due), days: totals.oldest.days })}
              </p>
            </>
          ) : (
            <p className="m-0 text-[15px] text-ink-3">{t("noOldest")}</p>
          )}
        </article>
      </section>

      <SupplierList
        projectId={projectId}
        suppliers={suppliers.data}
        accounts={accounts.data.map(({ id, name, balance }) => ({ id, name, balance }))}
        today={today}
        canWrite={canWrite}
      />
    </div>
  );
}
