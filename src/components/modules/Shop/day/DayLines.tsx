import { useTranslations } from "next-intl";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { DraftLine } from "./dayDraft";

type DayLinesProps = {
  kind: "credits" | "collects";
  rows: DraftLine[];
  onChange: (rows: DraftLine[]) => void;
  // For paybacks: what each name may still pay, or null when the name is not in the book.
  payable?: (name: string) => number | null;
};

const input =
  "box-border h-10.5 w-full rounded-[10px] border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:shadow-focus";

// "বাকিতে কে কত নিলেন" / "কে বাকি শোধ করলেন" (board BizDayNew): a name and an amount per row.
export function DayLines({ kind, rows, onChange, payable }: DayLinesProps) {
  const t = useTranslations("Shop.form");
  const set = (i: number, patch: Partial<DraftLine>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold">
          {t(kind)} {kind === "collects" && <span className="font-normal text-ink-3">{t("inCash")}</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange([...rows, { name: "", amount: "" }])}
          className="h-7.5 cursor-pointer rounded-lg border border-dashed border-line-strong bg-transparent px-2.5 text-[13px] font-semibold text-brand"
        >
          {t("addRow")}
        </button>
      </div>
      {rows.map((r, i) => {
        const n = i + 1;
        const most = payable && r.name.trim() ? payable(r.name) : undefined;
        const amount = Number(r.amount || 0);
        const over = most !== undefined && most !== null && amount > most;
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_36px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_150px_36px]">
              <input
                type="text"
                list="khata-names"
                aria-label={t(kind === "credits" ? "creditName" : "collectName", { n })}
                placeholder={t("namePlaceholder")}
                value={r.name}
                maxLength={80}
                onChange={(event) => set(i, { name: event.target.value })}
                className={input}
              />
              <MoneyInput
                aria-label={t("amountN", { n })}
                placeholder="0"
                value={r.amount}
                onChange={(value) => set(i, { amount: value })}
                invalid={over}
                wrapperClassName="h-10.5 gap-1.5 rounded-[10px] px-2.5"
                className="text-[15px]"
              />
              <button
                type="button"
                aria-label={t("removeRow", { n })}
                onClick={() => onChange(rows.filter((_, j) => j !== i))}
                className="size-9 cursor-pointer rounded-lg border-none bg-transparent text-lg text-ink-5"
              >
                ×
              </button>
            </div>
            {most !== undefined && (
              <span className={cn("text-xs", most === null || over ? "text-danger" : "text-ink-3")}>
                {most === null
                  ? t("unknown")
                  : over
                    ? t("owesOnly", { due: formatAmount(most) })
                    : t("owes", { due: formatAmount(most), after: formatAmount(most - amount) })}
              </span>
            )}
          </div>
        );
      })}
      {rows.length === 0 && <span className="text-[13px] text-ink-3">{t(kind === "credits" ? "noCredit" : "noCollect")}</span>}
    </div>
  );
}
