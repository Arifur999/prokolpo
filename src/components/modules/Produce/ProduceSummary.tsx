import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import { produceSummary } from "@/lib/produceLook";
import { cn } from "@/lib/utils";
import type { IProduceBook } from "@/types/produce.types";
import type { FarmType } from "@/types/project.types";

const signed = (n: number) => `${n < 0 ? "−" : "+"} ৳ ${formatAmount(Math.abs(n))}`;

type ProduceSummaryProps = { book: IProduceBook; farmType: FarmType; setupName: string };

// The four cards at the top of the farm sales page (board FarmSales).
export function ProduceSummary({ book, farmType, setupName }: ProduceSummaryProps) {
  const t = useTranslations("Produce");
  const s = produceSummary(book);
  const loss = s.profit < 0;
  const percent = `${s.setupPercent.toFixed(1)}%`;
  const card = "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5";

  return (
    <section aria-label={t("summaryLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t("total")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(s.total)}</p>
        <p className="m-0 text-[13px] text-ink-3">{t("totalSub", { batches: s.batchCount, count: book.sales.length })}</p>
      </article>
      <article className={cn(card, loss ? "border-danger-line bg-danger-tint" : "border-brand-edge bg-brand-wash")}>
        <h2 className={cn("m-0 text-sm font-semibold", loss ? "text-danger" : "text-success")}>{t("profit")}</h2>
        <p className={cn("m-0 text-[26px] leading-[1.2] font-bold", loss ? "text-danger" : "text-success")}>{signed(s.profit)}</p>
        <p className="m-0 text-[13px] text-ink-2">
          {s.finished ? t("profitSub", { done: s.finished, gain: s.gains, loss: s.finished - s.gains }) : t("noFinished")}
        </p>
      </article>
      <article className={cn(card, "border-gold-line bg-gold-wash")}>
        <h2 className="m-0 text-sm font-semibold text-gold-deep">{t("due")}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(s.due)}</p>
        <p className="m-0 text-[13px] text-ink-2">{book.dues.length ? t("dueSub", { count: book.dues.length }) : t("noDue")}</p>
      </article>
      <article className={cn(card, "border-line-2 bg-white")}>
        <h2 className="m-0 text-sm font-medium text-ink-2">{t(`setupCard.${farmType}`)}</h2>
        <p className="m-0 text-[26px] leading-[1.2] font-semibold">{percent}</p>
        <div role="img" aria-label={t("setupAria", { setup: setupName, percent })} className="flex flex-col gap-1">
          <span className="h-1.5 overflow-hidden rounded-full bg-line-3">
            <span className="block h-full rounded-full bg-brand-mid" style={{ width: percent }} />
          </span>
          <span className="text-[13px] text-ink-3">{t("setupSub", { back: formatAmount(s.setupBack), cost: formatAmount(book.setupCost) })}</span>
        </div>
      </article>
    </section>
  );
}
