"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { payContractorAction } from "@/app/(dashboardLayout)/projects/[projectId]/contractors/_action";
import { PayDialog, type PayAccount, type QuickAmount } from "@/components/shared/PayDialog";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IContractor, PaymentPurpose } from "@/types/books.types";

type ContractorPayDialogProps = {
  projectId: string;
  contractor: IContractor;
  accounts: PayAccount[];
  // This week's wages, for the daily-team quick amount.
  weekWages?: number;
  onClose: () => void;
};

const PURPOSES: Record<"DAILY" | "CONTRACT", PaymentPurpose[]> = {
  DAILY: ["WAGE", "ADVANCE", "OTHER"],
  CONTRACT: ["INSTALL", "ADVANCE", "EXTRA", "FINAL"],
};

// Paying a contractor or a daily team, and what for (board ContractorPay).
export function ContractorPayDialog({ projectId, contractor: c, accounts, weekWages, onClose }: ContractorPayDialogProps) {
  const t = useTranslations("PayDialog");
  const tc = useTranslations("Contractors.pay");
  const router = useRouter();
  const purposes = PURPOSES[c.payType];
  const [purpose, setPurpose] = useState<PaymentPurpose>(purposes[0]!);
  const [isPending, startTransition] = useTransition();

  const daily = c.payType === "DAILY";
  const contractPercent = c.contractAmount ? Math.round((c.paid / c.contractAmount) * 100) : 0;
  const sub = [
    c.phone && displayPhone(c.phone),
    daily ? null : tc("contractPaid", { percent: contractPercent, amount: formatAmount(c.paid) }),
    c.lastPayDate && c.lastPayAmount ? tc("lastPayment", { date: dayFirst(c.lastPayDate.slice(0, 10)), amount: formatAmount(c.lastPayAmount) }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const full = { label: t("quickFullContractor", { amount: formatAmount(c.due) }), amount: c.due };
  const quick: QuickAmount[] = daily
    ? [full, ...(weekWages ? [{ label: tc("weekWages", { amount: formatAmount(weekWages) }), amount: weekWages }] : []), { label: "৳ 20,000", amount: 20_000 }]
    : [
        full,
        { label: t("quickHalf", { amount: formatAmount(Math.round(c.due / 2000) * 1000) }), amount: Math.round(c.due / 2000) * 1000 },
        { label: "৳ 20,000", amount: 20_000 },
        { label: "৳ 50,000", amount: 50_000 },
      ];

  return (
    <PayDialog
      name={c.name}
      sub={sub}
      due={c.due}
      variant="contractor"
      accounts={accounts}
      quick={quick}
      extraPayload={{ purpose }}
      extra={
        <div role="radiogroup" aria-labelledby="pay-purpose-title" className="flex flex-col gap-2">
          <span id="pay-purpose-title" className="text-[15px] font-semibold">
            {t("purpose")}
          </span>
          <div className="flex flex-col gap-1.5">
            {purposes.map((value) => {
              const on = value === purpose;
              return (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg text-sm",
                    on ? "border-2 border-brand bg-brand-wash px-2.75 py-2" : "border border-line bg-white px-3 py-2.25",
                  )}
                >
                  <input type="radio" name="pay-purpose" checked={on} onChange={() => setPurpose(value)} className="m-0 size-4 shrink-0 accent-brand" />
                  <span className="font-medium">{t(`purposes.${value}`)}</span>
                </label>
              );
            })}
          </div>
        </div>
      }
      pending={isPending}
      onClose={onClose}
      onSubmit={(payment, print) =>
        startTransition(async () => {
          const result = await payContractorAction(projectId, c.id, payment);
          if (!result.success) return void toast.error(result.message);
          toast.success(t("doneContractor", { name: c.name, amount: formatAmount(payment.amount) }) + (print ? t("printing") : ""));
          onClose();
          router.refresh();
          if (print) window.print();
        })
      }
    />
  );
}
