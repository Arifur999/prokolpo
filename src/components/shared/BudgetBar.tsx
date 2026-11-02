import { budgetTone, type BudgetTone } from "@/lib/money";
import { cn } from "@/lib/utils";

const FILL: Record<BudgetTone, string> = { ok: "bg-brand-mid", near: "bg-gold-strong", over: "bg-danger-strong" };

type BudgetBarProps = {
  percent: number;
  label: string;
  className?: string;
};

// The thin budget meter on cards and phase lists: green, yellow past 90%, red past 100%.
export function BudgetBar({ percent, label, className }: BudgetBarProps) {
  return (
    <div role="img" aria-label={label} className={cn("h-2 overflow-hidden rounded-full bg-line-3", className)}>
      <div className={cn("h-full rounded-full", FILL[budgetTone(percent)])} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}
