import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatPercent, formatQuantity } from "@/lib/money";
import { batchProfit, batchRunning, batchStarted, lossRate, perKilo, produceSummary } from "@/lib/produceLook";
import { cn } from "@/lib/utils";
import type { IBatch, IProduceBook } from "@/types/produce.types";
import type { FarmType } from "@/types/project.types";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_150px_120px_120px_150px_300px] lg:items-center lg:gap-x-3";
const DAY_MS = 86_400_000;
const signed = (n: number) => `${n < 0 ? "−" : "+"} ৳ ${formatAmount(Math.abs(n))}`;

type BatchTableProps = {
  book: IProduceBook;
  farmType: FarmType;
  setupName: string;
  today: string;
  canWrite: boolean;
  onEdit: (batch: IBatch) => void;
};

// "ব্যাচ অনুযায়ী লাভ-ক্ষতি" (board FarmSales): each batch's cost against its sales, a bar
// either side of zero, and the setup cost that finished batches pay back.
export function BatchTable({ book, farmType, setupName, today, canWrite, onEdit }: BatchTableProps) {
  const t = useTranslations("Produce.batches");
  const tp = useTranslations("Produce");
  const shown = book.batches.filter(batchStarted);
  const maxAbs = Math.max(1, ...shown.filter((b) => !batchRunning(b)).map((b) => Math.abs(batchProfit(b))));
  const s = produceSummary(book);

  const span = (b: IBatch) => {
    if (b.startedOn && batchRunning(b)) {
      const age = Math.round((Date.parse(today) - Date.parse(b.startedOn)) / DAY_MS);
      return t("spanRunning", { start: dayFirst(b.startedOn), age });
    }
    if (b.startedOn && b.endedOn) return t("spanDone", { start: dayFirst(b.startedOn), end: dayFirst(b.endedOn) });
    return b.endedOn ? t("spanEnded", { end: dayFirst(b.endedOn) }) : t("spanNone");
  };

  return (
    <section aria-labelledby="bt-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-2 px-5 py-3.5">
        <div className="flex flex-col">
          <h2 id="bt-title" className="m-0 text-[17px] font-semibold">
            {t("title")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("note")}</span>
        </div>
        <span className="flex items-center gap-3.5 text-[13px] text-ink-2">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-3 rounded-xs bg-brand-mid" />
            {t("gain")}
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-3 rounded-xs bg-danger-strong" />
            {t("loss")}
          </span>
        </span>
      </div>
      <div role="table" aria-labelledby="bt-title">
        <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}>
          <span role="columnheader">{t("batch")}</span>
          <span role="columnheader">{t(`heads.${farmType}`)}</span>
          <span role="columnheader" className="text-right">
            {t("cost")}
          </span>
          <span role="columnheader" className="text-right">
            {t("sales")}
          </span>
          <span role="columnheader">{t("perKg")}</span>
          <span role="columnheader" className="text-center">
            {t("profit")}
          </span>
        </div>
        {shown.map((b) => {
          const running = batchRunning(b);
          const profit = batchProfit(b);
          const kilo = perKilo(b);
          const rate = lossRate(b);
          const width = `${((Math.abs(profit) / maxAbs) * 100).toFixed(1)}%`;
          return (
            <div
              key={b.id}
              role="row"
              className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line-3 px-5 py-2.5", running && "bg-gold-glow", GRID)}
            >
              <span role="cell" className="flex min-w-40 grow flex-col">
                <span className="flex items-center gap-2">
                  {canWrite ? (
                    <button
                      type="button"
                      aria-label={t("edit", { name: b.name })}
                      onClick={() => onEdit(b)}
                      className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-bold text-ink underline decoration-line-strong decoration-dotted underline-offset-4 hover:text-brand"
                    >
                      {b.name}
                    </button>
                  ) : (
                    <strong className="text-[15px] font-bold">{b.name}</strong>
                  )}
                  {running && <span className="rounded-full bg-gold-tint px-2 text-xs font-bold text-gold-ink">{t("running")}</span>}
                </span>
                <span className="text-xs text-ink-3">{span(b)}</span>
              </span>
              <span role="cell" className="flex flex-col">
                <span className="text-sm">{b.headCount ? t("count", { word: tp(`headWord.${farmType}`), count: formatAmount(b.headCount) }) : "—"}</span>
                {rate !== null && (
                  <span className={cn("text-xs", rate > 5 ? "text-danger" : "text-ink-3")}>
                    {[t("losses", { count: b.losses, percent: formatPercent(rate) }), b.note].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <span role="cell" className="text-right text-[15px]">
                {formatAmount(b.cost)}
                {running && "*"}
              </span>
              <span role="cell" className="text-right text-[15px] font-semibold">
                {formatAmount(b.sales)}
              </span>
              <span role="cell" className="flex flex-col">
                <span className="text-sm">
                  {kilo && !running ? t("perKgText", { cost: formatAmount(kilo.cost), price: formatAmount(kilo.price) }) : running ? t("perKgLater") : "—"}
                </span>
                {b.weight > 0 && <span className="text-xs text-ink-3">{t("kgSold", { kg: formatQuantity(b.weight) })}</span>}
              </span>
              <span role="cell" className="flex w-full items-center gap-2.5 lg:w-auto">
                {running ? (
                  <span className="text-[13px] leading-[1.45] text-ink-2">
                    {t("runningNote", { cost: formatAmount(b.cost), sales: formatAmount(b.sales) })}
                  </span>
                ) : (
                  <>
                    <span
                      role="img"
                      aria-label={t("aria", { name: b.name, kind: profit < 0 ? t("loss") : t("gain"), amount: formatAmount(Math.abs(profit)) })}
                      className="flex h-3.5 w-45 shrink-0"
                    >
                      <span className="flex w-1/2 justify-end border-r-[1.5px] border-ink-5">
                        {profit < 0 && <span className="h-full rounded-l-[3px] bg-danger-strong" style={{ width }} />}
                      </span>
                      <span className="flex w-1/2">{profit > 0 && <span className="h-full rounded-r-[3px] bg-brand-mid" style={{ width }} />}</span>
                    </span>
                    <strong className={cn("text-[15px] font-bold whitespace-nowrap", profit < 0 ? "text-danger" : "text-success")}>{signed(profit)}</strong>
                  </>
                )}
              </span>
            </div>
          );
        })}
        {shown.length === 0 && <p className="m-0 border-b border-line-3 px-5 py-6 text-center text-[15px] text-ink-3">{t("empty")}</p>}
        <div role="row" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 bg-surface-2 px-5 py-2.5 text-sm", GRID)}>
          <span role="cell" className="flex flex-col">
            <strong className="font-bold">{setupName}</strong>
            <span className="text-xs text-ink-3">{t("setupSub")}</span>
          </span>
          <span role="cell" className="hidden lg:block" />
          <span role="cell" className="text-right font-semibold">
            {formatAmount(book.setupCost)}
          </span>
          <span role="cell" className="hidden lg:block" />
          <span role="cell" className="hidden lg:block" />
          <span role="cell" className="text-[13px] text-ink-2">
            {t("setupLine", { percent: `${s.setupPercent.toFixed(1)}%`, left: formatAmount(s.setupLeft) })}
          </span>
        </div>
      </div>
    </section>
  );
}
