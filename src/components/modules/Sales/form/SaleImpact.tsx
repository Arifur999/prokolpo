import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { planInstallments } from "@/lib/saleLook";
import { cn } from "@/lib/utils";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import type { SaleDraft } from "./saleDraft";

type SaleImpactProps = { draft: SaleDraft; unitName: string; buyerName: string; buyer: string; buyerNote: string; account?: PickableAccount; owedNow: number };

// "সেভ করলে যা হবে" (board SaleNew): the unit's new state, the buyer, the money in today,
// what customers will owe, and the installment schedule.
export function SaleImpact({ draft, unitName, buyerName, buyer, buyerNote, account, owedNow }: SaleImpactProps) {
  const t = useTranslations("SaleNew");
  const price = Number(draft.price || 0);
  const kist = draft.plan === "KIST";
  const down = kist ? Number(draft.down || 0) : price;
  const plan = kist ? planInstallments(price, down, draft.count, draft.interval, draft.firstDue) : { each: 0, last: 0, rows: [] };
  const rows = plan.rows.length > 5 ? [...plan.rows.slice(0, 3), null, plan.rows.at(-1)] : plan.rows;
  const total = down + plan.rows.reduce((n, r) => n + r.amount, 0);
  const parts =
    plan.last !== plan.each ? `${draft.count - 1} × ${formatAmount(plan.each)} + ${formatAmount(plan.last)}` : `${draft.count} × ${formatAmount(plan.each)}`;
  const block = "flex flex-col gap-1 border-b border-line-3 py-3.5";

  return (
    <aside aria-labelledby="s-impact-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white xl:sticky xl:top-4">
      <div className="flex flex-col gap-1 bg-brand px-6 py-5 text-white">
        <span id="s-impact-title" className="text-[13px] font-semibold text-white/70">
          {t("impactTitle")}
        </span>
        <span className="text-[30px] leading-[1.25] font-bold">৳ {formatAmount(price)}</span>
        <span className="text-sm text-white/80">
          {unitName} · {buyerName}
        </span>
      </div>
      <div className="flex flex-col px-6 pt-1 pb-2">
        <div className={block}>
          <span className="text-[15px] font-semibold">{unitName}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-brand-tint px-2 font-semibold text-success">{t("free")}</span>
            <Icon name="arrowRight" size={14} strokeWidth={2} className="text-ink-3" />
            <span className={cn("rounded-full px-2 font-semibold", kist ? "bg-gold-tint text-gold-ink" : "bg-[#E9E7E0] text-ink-2")}>
              {kist ? t("booked") : t("sold")}
            </span>
          </div>
        </div>
        <div className={block}>
          <span className="text-[15px] font-semibold">{buyer}</span>
          <span className="text-[13px] text-ink-3">{buyerNote}</span>
        </div>
        {down > 0 && account && (
          <div className={block}>
            <span className="text-[15px] font-semibold">{t(kist ? "accLineKist" : "accLineFull", { amount: formatAmount(down), account: account.name })}</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-3">৳ {formatAmount(account.balance)}</span>
              <Icon name="arrowRight" size={14} strokeWidth={2} className="text-ink-3" />
              <strong className="font-bold text-success">৳ {formatAmount(account.balance + down)}</strong>
            </div>
          </div>
        )}
        <div className={block}>
          <span className="text-[15px] font-semibold">{t("owed")}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-3">৳ {formatAmount(owedNow)}</span>
            <Icon name="arrowRight" size={14} strokeWidth={2} className="text-ink-3" />
            <strong className="font-bold text-gold-ink">৳ {formatAmount(owedNow + Math.max(0, price - down))}</strong>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-3.5 pb-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">{t("schedTitle")}</span>
            {plan.rows.length > 0 && (
              <span className="text-[13px] text-ink-3">{t("schedHead", { count: draft.count, every: t(`every${draft.interval}`) })}</span>
            )}
          </div>
          {plan.rows.length > 0 ? (
            <>
              <div role="table" aria-label={t("schedTitle")} className="flex flex-col overflow-hidden rounded-[10px] border border-line-3">
                {rows.map((r, i) =>
                  r ? (
                    <div key={r.no} role="row" className="grid grid-cols-[70px_1fr_auto] gap-2 border-b border-surface-4 px-3 py-1.5 text-sm">
                      <span role="cell" className="text-ink-2">
                        {t("schedRow", { no: r.no })}
                      </span>
                      <span role="cell">{dayFirst(r.due)}</span>
                      <span role="cell" className="text-right font-semibold">
                        ৳ {formatAmount(r.amount)}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={`gap-${i}`}
                      role="row"
                      className="grid grid-cols-[70px_1fr_auto] gap-2 border-b border-surface-4 bg-surface-3 px-3 py-1.5 text-sm"
                    >
                      <span role="cell" className="text-ink-2">
                        …
                      </span>
                      <span role="cell">{t("schedMore", { count: draft.count - 4 })}</span>
                      <span role="cell" />
                    </div>
                  ),
                )}
              </div>
              <p className={cn("m-0 rounded-lg px-2.5 py-2 text-[13px]", total === price ? "bg-brand-wash text-brand" : "bg-danger-tint text-danger")}>
                {t(total === price ? "schedCheck" : "schedOff", { down: formatAmount(down), parts, total: formatAmount(total) })}
              </p>
            </>
          ) : (
            <p className="m-0 text-sm text-ink-3">{kist ? t("noSched") : t("noSchedFull")}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
