import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { percentText } from "@/lib/partnerMath";
import { partnerReceiptHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IPartnerDetail } from "@/types/partners.types";

const GRID = "lg:grid lg:grid-cols-[96px_minmax(0,1fr)_112px_112px_116px_40px] lg:items-center lg:gap-x-2";

// "জমার খাতা" (board PartnerDetail): what the partner owes goes up, deposits bring it down,
// with the running balance and each deposit's receipt.
export function PartnerLedger({ projectId, detail }: { projectId: string; detail: IPartnerDetail }) {
  const t = useTranslations("Partners.detail");
  const p = detail.partner;
  const balances = detail.entries.reduce<number[]>((acc, e) => [...acc, (acc.at(-1) ?? 0) + (e.kind === "DUE" ? e.amount : -e.amount)], []);
  const balance = (n: number) => (n > 0 ? formatAmount(n) : n === 0 ? t("settled") : t("advance", { amount: formatAmount(-n) }));
  const should = detail.entries.filter((e) => e.kind === "DUE").reduce((sum, e) => sum + e.amount, 0);
  const paid = detail.entries.filter((e) => e.kind === "PAID").reduce((sum, e) => sum + e.amount, 0);

  return (
    <section aria-labelledby="lg-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-col gap-0.5 border-b border-line-2 px-5 py-4">
        <h2 id="lg-title" className="m-0 text-[17px] font-semibold">
          {t("ledgerTitle")}
        </h2>
        <p className="m-0 text-sm text-ink-2">{t("ledgerNote")}</p>
      </div>
      <div role="table" aria-labelledby="lg-title">
        <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 pr-4 pl-5 text-[13px] font-semibold text-ink-2", GRID)}>
          <span role="columnheader">{t("colDate")}</span>
          <span role="columnheader">{t("colDesc")}</span>
          <span role="columnheader" className="text-right">
            {t("colDue")}
          </span>
          <span role="columnheader" className="text-right">
            {t("colPaid")}
          </span>
          <span role="columnheader" className="text-right">
            {t("colBalance")}
          </span>
          <span role="columnheader">
            <span className="sr-only">{t("colReceipt")}</span>
          </span>
        </div>
        {detail.entries.map((e, i) => {
          const isDue = e.kind === "DUE";
          const callDate = e.callDate ? dayFirst(e.callDate).slice(0, 5) : "";
          const title = isDue ? (e.callId ? t("callTitle", { date: callDate }) : t("mainTitle")) : e.callId ? t("paidCall", { date: callDate }) : t("paidMain");
          const sub = isDue
            ? e.callId
              ? t("callSub", { reason: e.reason ?? "", total: formatAmount(e.callTotal ?? 0), share: percentText(p.share) })
              : t("mainSub", { total: formatAmount(detail.totalCommitted), share: percentText(p.share) })
            : [e.account, e.note].filter(Boolean).join(" · ");
          return (
            <div
              key={`${e.kind}-${e.depositId ?? e.callId ?? "main"}-${i}`}
              role="row"
              className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 py-2.5 pr-4 pl-5 lg:min-h-16", GRID)}
            >
              <span role="cell" className="text-sm text-ink-2">
                {dayFirst(e.date.slice(0, 10))}
              </span>
              <span role="cell" className="flex min-w-0 grow items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                    isDue ? "bg-gold-tint text-gold-ink" : "bg-brand-tint text-success",
                  )}
                >
                  <Icon name={isDue ? "plus" : "check"} size={15} strokeWidth={2.4} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-semibold">{title}</span>
                  {sub && <span className="text-[13px] text-ink-3">{sub}</span>}
                </span>
              </span>
              <span role="cell" className="text-right text-[15px] font-semibold text-gold-ink">
                {isDue ? formatAmount(e.amount) : ""}
              </span>
              <span role="cell" className="text-right text-[15px] font-semibold text-success">
                {isDue ? "" : formatAmount(e.amount)}
              </span>
              <span role="cell" className="text-right text-[15px] font-bold">
                {balance(balances[i] ?? 0)}
              </span>
              <span role="cell" className="flex justify-end">
                {e.depositId && e.receiptNo && (
                  <Link
                    href={partnerReceiptHref(projectId, e.depositId)}
                    aria-label={t("receiptLabel", { no: e.receiptNo })}
                    title={t("receiptLabel", { no: e.receiptNo })}
                    className="flex size-8.5 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
                  >
                    <Icon name="receipt" size={16} strokeWidth={2} />
                  </Link>
                )}
              </span>
            </div>
          );
        })}
        <div role="row" className={cn("flex flex-wrap gap-x-3 bg-surface-2 py-3 pr-4 pl-5 text-sm font-bold", GRID)}>
          <span role="cell" />
          <span role="cell">{t("total")}</span>
          <span role="cell" className="text-right text-gold-ink">
            {formatAmount(should)}
          </span>
          <span role="cell" className="text-right text-success">
            {formatAmount(paid)}
          </span>
          <span role="cell" className="text-right text-base">
            ৳ {formatAmount(Math.max(0, should - paid))}
          </span>
          <span role="cell" />
        </div>
      </div>
    </section>
  );
}
