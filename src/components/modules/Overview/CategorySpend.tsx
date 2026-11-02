import { useTranslations } from "next-intl";
import { formatAmount, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Panel, PanelEmpty } from "./Panel";

export type CategoryTotal = { name: string; amount: number; rest?: boolean };

type CategorySpendProps = {
  rows: CategoryTotal[];
  total: number;
  allHref: string;
};

// "খাত অনুযায়ী খরচ": the biggest heads, bars scaled to the largest, the rest grouped in grey.
export function CategorySpend({ rows, total, allHref }: CategorySpendProps) {
  const t = useTranslations("Overview.byCategory");
  const largest = Math.max(1, ...rows.map((row) => row.amount));

  return (
    <Panel title={t("title")} subtitle={t("subtitle", { amount: formatAmount(total) })} link={{ href: allHref, label: t("all") }} className="lg:col-span-2">
      {rows.length === 0 ? (
        <PanelEmpty>{t("empty")}</PanelEmpty>
      ) : (
        <ul className="m-0 flex grow list-none flex-col justify-around gap-3 p-0">
          {rows.map((row) => (
            <li key={row.name} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 sm:grid-cols-[124px_minmax(0,1fr)_164px]">
              <span className={cn("text-[15px] font-medium", row.rest && "text-ink-2")}>{row.name}</span>
              <div className="h-3">
                <div className={cn("h-full rounded-r", row.rest ? "bg-ink-5" : "bg-brand-mid")} style={{ width: `${(row.amount / largest) * 100}%` }} />
              </div>
              <span className="text-right text-sm whitespace-nowrap">
                ৳ {formatAmount(row.amount)} <span className="text-ink-3">· {formatPercent(total ? (row.amount / total) * 100 : 0)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
