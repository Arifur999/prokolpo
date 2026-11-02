import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import type { DueNote, duesReport } from "@/lib/reportDues";
import { cn } from "@/lib/utils";

type DuesReportProps = { report: ReturnType<typeof duesReport>; cash: number; accountCount: number };

const card = "flex flex-col gap-1 rounded-2xl border px-4.5 py-4";

// Owed and owing (board Reports, DUES): totals, then one list per kind of party.
export function DuesReport({ report: d, cash, accountCount }: DuesReportProps) {
  const t = useTranslations("Reports.dues");
  const note = (n: DueNote) => {
    switch (n.kind) {
      case "next":
        return t("nextDue", { unit: n.unit, date: dayFirst(n.date).slice(0, 5) });
      case "late":
        return t("lateDays", { unit: n.unit, days: n.days });
      case "pledge":
        return t("partnerCommit");
      case "call":
        return t("partnerCall", { committed: formatAmount(n.committed), call: formatAmount(n.call) });
      case "lastBill":
        return t("lastBill", { date: dayFirst(n.date) });
      case "owing":
        return t("owingDays", { days: n.days });
      case "daily":
        return t("daily");
      case "contract":
        return t("contract");
      default:
        return "";
    }
  };

  return (
    <>
      <section aria-label={t("cardsLabel")} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className={cn(card, "border-brand-edge bg-brand-wash")}>
          <h2 className="m-0 text-[13px] font-semibold text-success">{t("get")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(d.get)}</p>
          <p className="m-0 text-xs text-ink-3">{t("getSub")}</p>
        </article>
        <article className={cn(card, "border-gold-line bg-gold-wash")}>
          <h2 className="m-0 text-[13px] font-semibold text-gold-deep">{t("give")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(d.give)}</p>
          <p className="m-0 text-xs text-ink-3">{t("giveSub")}</p>
        </article>
        <article className={cn(card, "border-line-2 bg-white")}>
          <h2 className="m-0 text-[13px] font-semibold text-ink-2">{t("cash")}</h2>
          <p className="m-0 text-[23px] leading-[1.2] font-bold">৳ {formatAmount(cash)}</p>
          <p className="m-0 text-xs text-ink-3">{t("cashSub", { count: accountCount, give: formatAmount(d.give) })}</p>
        </article>
      </section>
      <div className="grid grid-cols-1 items-start gap-4.5 lg:grid-cols-2">
        {d.groups.map((g) => {
          const max = Math.max(1, ...g.items.map((i) => i.amount));
          return (
            <section key={g.key} aria-labelledby={`dg-${g.key}`} className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
              <div className="flex items-center justify-between border-b border-line-2 px-4.5 py-3">
                <h2 id={`dg-${g.key}`} className="m-0 flex items-center gap-2 text-[15px] font-semibold">
                  <span
                    aria-hidden="true"
                    className={cn("rounded-full px-2 text-xs font-bold", g.get ? "bg-brand-tint text-success" : "bg-gold-tint text-gold-ink")}
                  >
                    {g.get ? t("tagGet") : t("tagGive")}
                  </span>
                  {t(g.key)}
                </h2>
                <strong className="text-[15px] font-bold">৳ {formatAmount(g.total)}</strong>
              </div>
              {g.items.length ? (
                <ul className="m-0 list-none p-0">
                  {g.items.map((i) => (
                    <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_90px_100px] items-center gap-2.5 border-b border-line-3 px-4.5 py-2">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold">{i.name}</span>
                        <span className={cn("text-xs", i.red ? "text-danger" : "text-ink-3")}>{note(i.note)}</span>
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-line-3">
                        <span
                          className={cn("block h-full", g.get ? "bg-brand-mid" : "bg-gold-strong")}
                          style={{ width: `${((i.amount / max) * 100).toFixed(1)}%` }}
                        />
                      </span>
                      <span className="text-right text-sm font-bold">৳ {formatAmount(i.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 px-4.5 py-4 text-sm text-ink-3">{t("none")}</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
