import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ICapitalCall } from "@/types/partners.types";

// "ক্যাপিটাল কল": each call with everyone's part and how much has come in.
export function CapitalCalls({ calls, onNew }: { calls: ICapitalCall[]; onNew?: () => void }) {
  const t = useTranslations("Partners");

  return (
    <section aria-labelledby="cc-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-2 px-5 py-3.5">
        <div className="flex flex-col">
          <h2 id="cc-title" className="m-0 text-[17px] font-semibold">
            {t("callsTitle")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("callsNote")}</span>
        </div>
        {onNew && (
          <button
            type="button"
            onClick={onNew}
            className="flex h-9.5 cursor-pointer items-center gap-1.5 rounded-[10px] border border-brand bg-white px-3.5 text-sm font-semibold text-brand"
          >
            <Icon name="plus" size={16} strokeWidth={2.2} />
            {t("newCall")}
          </button>
        )}
      </div>
      {calls.map((c) => {
        const collected = c.parts.reduce((sum, p) => sum + Math.min(p.paid, p.amount), 0);
        const pending = c.parts.filter((p) => p.amount > 0 && p.paid < p.amount);
        const status = !pending.length
          ? t("callAll")
          : pending.length === c.parts.length
            ? t("callNobody")
            : t("callPending", { names: pending.map((p) => p.name).join(", ") });
        const percent = c.total ? (collected / c.total) * 100 : 0;
        return (
          <div
            key={c.id}
            className="grid grid-cols-1 items-center gap-2 border-b border-line-3 px-5 py-3.5 lg:grid-cols-[110px_minmax(0,1fr)_150px_260px] lg:gap-4"
          >
            <span className="text-sm text-ink-2">{dayFirst(c.date.slice(0, 10))}</span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[15px] font-semibold">{c.reason}</span>
              <span className="text-[13px] text-ink-3">{c.parts.map((p) => `${p.name.split(" ")[0]} ${formatAmount(p.amount)}`).join(" · ")}</span>
            </span>
            <span className="text-base font-bold lg:text-right">৳ {formatAmount(c.total)}</span>
            <span className="flex flex-col gap-1">
              <span className="flex justify-between gap-3 text-[13px]">
                <span className="whitespace-nowrap text-ink-2">{t("callCollected", { amount: formatAmount(collected) })}</span>
                <strong className={cn("font-semibold", pending.length ? "text-gold-ink" : "text-success")}>{status}</strong>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-line-3">
                <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${percent.toFixed(1)}%` }} />
              </span>
            </span>
          </div>
        );
      })}
      {calls.length === 0 && <p className="m-0 p-5 text-sm text-ink-3">{t("noCalls")}</p>}
    </section>
  );
}
