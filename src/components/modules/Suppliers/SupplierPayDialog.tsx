"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { openBillsAction, paySupplierAction } from "@/app/(dashboardLayout)/projects/[projectId]/suppliers/_action";
import { PayDialog, type PayAccount } from "@/components/shared/PayDialog";
import { dayFirst, expenseLines } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IExpense, ISupplier } from "@/types/books.types";

type SupplierPayDialogProps = {
  projectId: string;
  supplier: ISupplier;
  accounts: PayAccount[];
  onClose: () => void;
};

// Paying a supplier, optionally against one open bill (board SupplierPay).
export function SupplierPayDialog({ projectId, supplier, accounts, onClose }: SupplierPayDialogProps) {
  const t = useTranslations("PayDialog");
  const router = useRouter();
  const [bills, setBills] = useState<IExpense[]>([]);
  const [billId, setBillId] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void openBillsAction(projectId, supplier.id).then(setBills);
  }, [projectId, supplier.id]);

  const half = Math.round(supplier.due / 2000) * 1000;
  const sub = [supplier.phone && displayPhone(supplier.phone), t("billedPaid", { billed: formatAmount(supplier.billed), paid: formatAmount(supplier.paid) })]
    .filter(Boolean)
    .join(" · ");
  const options = [
    { id: "", label: t("generalPayment"), due: null as number | null },
    ...bills.map((b) => ({ id: b.id, label: `${expenseLines(b).title} · ${dayFirst(b.date)}`, due: b.amount - b.paidOnBill })),
  ];

  return (
    <PayDialog
      name={supplier.name}
      sub={sub}
      due={supplier.due}
      variant="supplier"
      accounts={accounts}
      quick={[
        { label: t("quickFull", { amount: formatAmount(supplier.due) }), amount: supplier.due },
        { label: t("quickHalf", { amount: formatAmount(half) }), amount: half },
        { label: "৳ 50,000", amount: 50_000 },
        { label: "৳ 1,00,000", amount: 100_000 },
      ]}
      extraPayload={billId ? { expenseId: billId } : {}}
      extra={
        <div role="radiogroup" aria-labelledby="pay-bill-title" className="flex flex-col gap-2">
          <span id="pay-bill-title" className="text-[15px] font-semibold">
            {t("bill")} <span className="font-normal text-ink-3">{t("optional")}</span>
          </span>
          <div className="flex flex-col gap-1.5">
            {options.map((option) => {
              const on = option.id === billId;
              return (
                <label
                  key={option.id || "general"}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg text-sm",
                    on ? "border-2 border-brand bg-brand-wash px-2.75 py-2" : "border border-line bg-white px-3 py-2.25",
                  )}
                >
                  <input type="radio" name="pay-bill" checked={on} onChange={() => setBillId(option.id)} className="m-0 size-4 shrink-0 accent-brand" />
                  <span className="grow font-medium">{option.label}</span>
                  {option.due !== null && (
                    <span className="text-[13px] whitespace-nowrap text-ink-3">{t("billDue", { amount: formatAmount(option.due) })}</span>
                  )}
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
          const result = await paySupplierAction(projectId, supplier.id, payment);
          if (!result.success) return void toast.error(result.message);
          toast.success(t("done", { name: supplier.name, amount: formatAmount(payment.amount) }) + (print ? t("printing") : ""));
          onClose();
          router.refresh();
          if (print) window.print();
        })
      }
    />
  );
}
