import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import type { IBuyerDue } from "@/types/produce.types";

type BuyerDuesProps = { dues: IBuyerDue[]; canWrite: boolean; onCollect: (due: IBuyerDue) => void };

// "ক্রেতাদের বাকি" (board FarmSales): who owes for what they bought, and since when.
export function BuyerDues({ dues, canWrite, onCollect }: BuyerDuesProps) {
  const t = useTranslations("Produce.dues");
  return (
    <section aria-labelledby="bd-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-col border-b border-line-3 px-4.5 py-3.5">
        <h2 id="bd-title" className="m-0 text-base font-semibold">
          {t("title")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("sub")}</span>
      </div>
      {dues.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {dues.map((d) => (
            <li key={d.buyerId} className="flex items-center gap-2.5 border-b border-line-3 px-4.5 py-3">
              <span className="flex min-w-0 grow flex-col">
                <span className="truncate text-[15px] font-semibold">{d.buyer}</span>
                <span className="text-xs text-ink-3">{t("since", { date: dayFirst(d.since) })}</span>
              </span>
              <strong className="text-[15px] font-bold whitespace-nowrap text-gold-ink">৳ {formatAmount(d.amount)}</strong>
              {canWrite && (
                <button
                  type="button"
                  aria-label={t("collectLabel", { name: d.buyer })}
                  onClick={() => onCollect(d)}
                  className="h-8 cursor-pointer rounded-lg border border-brand bg-white px-2.5 text-[13px] font-semibold whitespace-nowrap text-brand"
                >
                  {t("collect")}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 px-4.5 py-4 text-sm text-success">{t("none")}</p>
      )}
    </section>
  );
}
