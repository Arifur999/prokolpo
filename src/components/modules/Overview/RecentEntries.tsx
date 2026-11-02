import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import type { IOverviewData } from "@/types/books.types";
import { Panel, PanelEmpty } from "./Panel";

type Entry = IOverviewData["recent"][number];

const dayFirst = (iso: string) => iso.split("-").reverse().join("/");

// "সাম্প্রতিক এন্ট্রি": the latest bills and payments, newest first (board Main).
export function RecentEntries({ projectId, entries }: { projectId: string; entries: Entry[] }) {
  const t = useTranslations("Overview.recent");

  const describe = (entry: Entry) => {
    if (entry.kind === "PAYMENT") {
      return {
        title: entry.party ? t("paymentTo", { party: entry.party }) : t("payment"),
        sub: [entry.account && t("fromAccount", { account: entry.account }), dayFirst(entry.date)].filter(Boolean).join(" · "),
      };
    }
    const quantity = entry.quantity ? `${Number(entry.quantity)}${entry.unit ? ` ${entry.unit}` : ""}` : null;
    return {
      title: [entry.title, quantity].filter(Boolean).join(" · ") || (entry.detail ?? ""),
      sub: [entry.party, entry.phase, dayFirst(entry.date)].filter(Boolean).join(" · "),
    };
  };

  return (
    <Panel title={t("title")} link={{ href: projectHref(projectId, "expenses"), label: t("all") }} className="gap-2 lg:col-span-2">
      {entries.length === 0 ? (
        <PanelEmpty>{t("empty")}</PanelEmpty>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {entries.map((entry) => {
            const { title, sub } = describe(entry);
            const row = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-4 text-ink-2">
                  <Icon name={entry.kind === "PAYMENT" ? "banknote" : "receipt"} size={18} />
                </span>
                <span className="flex min-w-0 grow flex-col">
                  <span className="truncate text-[15px] font-medium">{title}</span>
                  <span className="truncate text-[13px] text-ink-3">{sub}</span>
                </span>
                <span className="hidden rounded-full bg-surface-4 px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap text-ink-2 sm:inline">
                  {t(`kind${entry.kind}`)}
                </span>
                <span className="w-27.5 shrink-0 text-right text-[15px] font-semibold whitespace-nowrap">৳ {formatAmount(entry.amount)}</span>
              </>
            );
            return (
              <li key={entry.ref} className="border-t border-line-3">
                {entry.expenseId ? (
                  <Link
                    href={projectHref(projectId, `expenses/${entry.expenseId}`)}
                    className="flex items-center gap-3.5 py-3 text-ink no-underline hover:text-ink"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3.5 py-3">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
