import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { daysAgo } from "@/lib/shopLook";
import { cn } from "@/lib/utils";
import type { IKhataPerson } from "@/types/shop.types";

type KhataListProps = { khata: IKhataPerson[]; today: string; canWrite: boolean; onCollect: (person: IKhataPerson) => void };

// "বাকির খাতা" (board BizSales): who owes the shop, the biggest first; over a month old is red.
export function KhataList({ khata, today, canWrite, onCollect }: KhataListProps) {
  const t = useTranslations("Shop.book");
  return (
    <section aria-labelledby="kh-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-col border-b border-line-3 px-4.5 py-3.5">
        <h2 id="kh-title" className="m-0 text-base font-semibold">
          {t("title")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("sub")}</span>
      </div>
      {khata.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {khata.map((k) => {
            const age = k.since ? daysAgo(k.since, today) : 0;
            return (
              <li key={k.id} className="flex flex-col gap-1.5 border-b border-line-3 px-4.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[15px] font-semibold">{k.name}</span>
                  <strong className="text-[15px] font-bold whitespace-nowrap text-gold-ink">৳ {formatAmount(k.due)}</strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-xs", age > 30 ? "text-danger" : "text-ink-3")}>
                    {t("age", { days: age, last: k.last ? dayFirst(k.last).slice(0, 5) : "—" })}
                  </span>
                  {canWrite && (
                    <button
                      type="button"
                      aria-label={t("collectLabel", { name: k.name })}
                      onClick={() => onCollect(k)}
                      className="h-7.5 cursor-pointer rounded-lg border border-brand bg-white px-2.5 text-xs font-semibold whitespace-nowrap text-brand"
                    >
                      {t("collect")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="m-0 border-b border-line-3 px-4.5 py-4 text-sm text-success">{t("none")}</p>
      )}
      <p className="m-0 px-4.5 py-3 text-xs leading-[1.55] text-ink-3">{t("note")}</p>
    </section>
  );
}
