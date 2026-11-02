import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import { incomeMix } from "@/lib/produceLook";
import type { IProduceSale } from "@/types/produce.types";

// "কী থেকে কত আয়" (board FarmSales): each product's share of all sales.
export function IncomeMix({ sales }: { sales: IProduceSale[] }) {
  const t = useTranslations("Produce");
  return (
    <section aria-labelledby="mx-title" className="flex flex-col gap-2.5 rounded-2xl border border-line-2 bg-white px-4.5 py-4">
      <h2 id="mx-title" className="m-0 text-base font-semibold">
        {t("mix.title")}
      </h2>
      {incomeMix(sales).map((m) => {
        const percent = `${m.percent.toFixed(1)}%`;
        return (
          <div key={m.product} className="flex flex-col gap-1">
            <div className="flex justify-between gap-2 text-sm">
              <span>{t(`products.${m.product}`)}</span>
              <span>
                <strong className="font-bold">৳ {formatAmount(m.amount)}</strong> <span className="text-ink-3">· {percent}</span>
              </span>
            </div>
            <span className="h-1.5 overflow-hidden rounded-full bg-line-3">
              <span className="block h-full bg-brand-mid" style={{ width: percent }} />
            </span>
          </div>
        );
      })}
      <p className="m-0 text-xs leading-[1.55] text-ink-3">{t("mix.note")}</p>
    </section>
  );
}
