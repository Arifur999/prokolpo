"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addExtraAction } from "@/app/(dashboardLayout)/projects/[projectId]/contractors/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { dhakaToday } from "@/lib/dhakaTime";
import { formatAmount } from "@/lib/money";

type ExtraWorkDialogProps = {
  projectId: string;
  contractorId: string;
  // Contract plus the extra work already added.
  total: number;
  onClose: () => void;
};

// "অতিরিক্ত কাজ যোগ": work agreed outside the contract (board ContractorLedgerContract).
export function ExtraWorkDialog({ projectId, contractorId, total, onClose }: ExtraWorkDialogProps) {
  const t = useTranslations("ContractorLedger.extra");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const extra = Number(amount || 0);

  const save = () => {
    setSubmitted(true);
    if (!title.trim() || !extra) return;
    startTransition(async () => {
      const result = await addExtraAction(projectId, contractorId, { title: title.trim(), amount: extra, date: dhakaToday() });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { amount: formatAmount(extra) }));
      onClose();
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle")}
      closeLabel={t("close")}
      onClose={onClose}
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <LabeledInput
        id="ex-what"
        autoFocus
        aria-required="true"
        maxLength={120}
        label={
          <>
            {t("what")} <span className="text-danger">*</span>
          </>
        }
        placeholder={t("whatPlaceholder")}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-invalid={submitted && !title.trim()}
        inputClassName={submitted && !title.trim() ? "border-[1.5px] border-danger-strong bg-danger-wash" : undefined}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ex-amount-extra" className="text-[15px] font-semibold">
          {t("amount")} <span className="text-danger">*</span>
        </label>
        <MoneyInput
          id="ex-amount-extra"
          aria-required="true"
          invalid={submitted && !extra}
          placeholder="0"
          value={amount}
          onChange={setAmount}
          wrapperClassName="w-full sm:w-65"
        />
      </div>
      <p className="m-0 rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm font-semibold">
        {t("preview", { before: `৳ ${formatAmount(total)}`, after: `৳ ${formatAmount(total + extra)}` })}
      </p>
    </FormDialog>
  );
}
