import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { formatAmount } from "@/lib/money";
import { batchProfit, batchRunning } from "@/lib/produceLook";
import { cn } from "@/lib/utils";
import type { IProduceBook } from "@/types/produce.types";
import { figures, type SaleDraft } from "./saleDraft";

const taka = (n: number) => `৳ ${formatAmount(n)}`;
const signed = (n: number) => `${n < 0 ? "−" : "+"} ৳ ${formatAmount(Math.abs(n))}`;

type Line = { key: string; title: string; before: string; after: string; tone: "brand" | "success" | "danger" | "gold"; note?: string };
const TONE = { brand: "text-brand", success: "text-success", danger: "text-danger", gold: "text-gold-ink" };

type SaleImpactProps = { book: IProduceBook; draft: SaleDraft; accounts: PickableAccount[] };

// "সেভ করলে যা হবে" (board FarmSaleNew): the batch's sales and profit, the buyer's due and
// the account, before and after.
export function SaleImpact({ book, draft, accounts }: SaleImpactProps) {
  const t = useTranslations("Produce.form");
  const { amount, got, left } = figures(draft);
  const batch = book.batches.find((b) => b.id === draft.phaseId);
  const buyer = draft.buyer.trim();
  const account = accounts.find((a) => a.id === draft.accountId);
  const lines: Line[] = [];
  if (batch) {
    const profit = batchProfit(batch);
    lines.push({ key: "sales", title: t("impactSales", { batch: batch.name }), before: taka(batch.sales), after: taka(batch.sales + amount), tone: "brand" });
    lines.push({
      key: "profit",
      title: t("impactProfit", { batch: batch.name }),
      before: signed(profit),
      after: signed(profit + amount),
      tone: profit + amount < 0 ? "danger" : "success",
      note: batchRunning(batch) ? t("impactRunning") : undefined,
    });
  }
  if (buyer && left > 0) {
    const owed = book.dues.find((d) => d.buyer.toLowerCase() === buyer.toLowerCase())?.amount ?? 0;
    lines.push({ key: "buyer", title: t("impactBuyer", { name: buyer }), before: taka(owed), after: taka(owed + left), tone: "gold" });
  }
  if (account && got > 0) {
    lines.push({ key: "account", title: account.name, before: taka(account.balance), after: taka(account.balance + got), tone: "success" });
  }

  return (
    <aside aria-label={t("impact")} className="flex flex-col border-t border-line-3 bg-surface-2 px-5 py-4 lg:border-t-0 lg:border-l">
      <span className="text-[13px] font-semibold text-ink-2">{t("impact")}</span>
      {lines.map((l) => (
        <div key={l.key} className="flex flex-col gap-0.5 border-b border-line-2 py-3">
          <span className="text-sm font-semibold">{l.title}</span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="text-ink-3">{l.before}</span>
            <Icon name="arrowRight" size={14} strokeWidth={2} className="text-ink-3" />
            <strong className={cn("font-bold", TONE[l.tone])}>{l.after}</strong>
          </span>
          {l.note && <span className="text-xs text-ink-3">{l.note}</span>}
        </div>
      ))}
    </aside>
  );
}
