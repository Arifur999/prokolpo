import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LedgerPayButton } from "@/components/modules/Suppliers/LedgerPayButton";
import { SupplierLedgerTable } from "@/components/modules/Suppliers/SupplierLedgerTable";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getAccounts, getSupplier } from "@/services/books.services";
import { loadProject } from "../../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Suppliers"))("title") };
}

function Card({ title, icon, value, note, tone }: { title: string; icon: IconName; value: string; note: string; tone?: "gold" }) {
  const gold = tone === "gold";
  return (
    <article className={cn("flex flex-col gap-2.5 rounded-2xl border p-5", gold ? "border-gold-line bg-gold-wash" : "border-line-2 bg-white")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cn("m-0 text-sm", gold ? "font-semibold text-gold-deep" : "font-medium text-ink-2")}>{title}</h2>
        <span
          className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px]", gold ? "bg-gold-tint text-gold-ink" : "bg-surface-4 text-ink-2")}
        >
          <Icon name={icon} size={18} />
        </span>
      </div>
      <p className={cn("m-0 text-[22px] leading-[1.2] lg:text-[26px]", gold ? "font-bold" : "font-semibold")}>{value}</p>
      <p className="m-0 text-[13px] text-ink-3">{note}</p>
    </article>
  );
}

// Board Ledger: one supplier's bills and payments.
export default async function SupplierLedgerPage({ params }: PageProps<"/projects/[projectId]/suppliers/[supplierId]">) {
  const { projectId, supplierId } = await params;
  const project = await loadProject(projectId);
  if (!project) notFound();
  const detail = await getSupplier(projectId, supplierId).then(
    (response) => response.data,
    () => null,
  );
  if (!detail) notFound();

  const [t, ts, accounts] = await Promise.all([getTranslations("Ledger"), getTranslations("Suppliers"), getAccounts(projectId)]);
  const { supplier: s, lines } = detail;
  const firstBill = lines.find((line) => line.kind === "BILL");
  const lastPayment = lines.findLast((line) => line.kind === "PAYMENT");
  const canWrite = project.role !== "VIEWER";

  return (
    <div className="flex grow flex-col gap-6 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <div className="flex flex-col gap-4">
        <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "suppliers")} className="text-ink-2 no-underline hover:text-ink">
            {ts("title")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {s.name}
          </span>
        </nav>
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <Icon name="store" size={26} />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{s.name}</h1>
              <p className="m-0 flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm text-ink-2">
                {s.phone && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="phone" size={15} strokeWidth={2} />
                    {displayPhone(s.phone)}
                  </span>
                )}
                {s.address && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="mapPin" size={15} strokeWidth={2} />
                    {s.address}
                  </span>
                )}
                {s.supplies.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="package" size={15} strokeWidth={2} />
                    {s.supplies.join(", ")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="hidden h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink sm:flex"
            >
              <Icon name="printer" size={18} />
              {t("print")}
            </button>
            {canWrite && (
              <>
                <Link
                  href={projectHref(projectId, "expenses/new")}
                  className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink no-underline hover:text-ink"
                >
                  <Icon name="plus" size={18} strokeWidth={2.2} />
                  {t("addBill")}
                </Link>
                <LedgerPayButton
                  projectId={projectId}
                  supplier={s}
                  accounts={accounts.data.map(({ id, name, balance }) => ({ id, name, balance }))}
                  label={t("pay")}
                />
              </>
            )}
          </div>
        </header>
      </div>

      <section aria-label={t("summary")} className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-5">
        <Card
          title={t("billed")}
          icon="receipt"
          value={`৳ ${formatAmount(s.billed)}`}
          note={firstBill ? t("billedNote", { count: s.billCount, date: dayFirst(firstBill.date) }) : t("billedNone")}
        />
        <Card title={t("paid")} icon="banknote" value={`৳ ${formatAmount(s.paid)}`} note={t("paidNote", { count: s.paymentCount })} />
        <Card
          title={t("due")}
          icon="wallet"
          tone="gold"
          value={s.due < 0 ? t("advance", { amount: formatAmount(-s.due) }) : `৳ ${formatAmount(s.due)}`}
          note={lastPayment ? t("dueNote", { date: dayFirst(lastPayment.date), amount: formatAmount(lastPayment.payment) }) : t("dueNoPayment")}
        />
      </section>

      <SupplierLedgerTable projectId={projectId} lines={lines} canWrite={canWrite} />
    </div>
  );
}
