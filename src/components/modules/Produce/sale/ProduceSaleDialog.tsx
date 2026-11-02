"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProduceSaleAction } from "@/app/(dashboardLayout)/projects/[projectId]/farm-sales/_action";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { ChoiceChips } from "@/components/shared/form/ChoiceChips";
import { DateField } from "@/components/shared/form/DateField";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { formatAmount } from "@/lib/money";
import { batchRunning, batchStarted, productsFor } from "@/lib/produceLook";
import { cn } from "@/lib/utils";
import type { IProduceBook } from "@/types/produce.types";
import { SaleAmountFields } from "./SaleAmountFields";
import { defaultBatch, figures, rateHint, saleProblem, type SaleDraft } from "./saleDraft";
import { SaleImpact } from "./SaleImpact";
import { SalePaidFields } from "./SalePaidFields";

type ProduceSaleDialogProps = {
  projectId: string;
  projectName: string;
  book: IProduceBook;
  accounts: PickableAccount[];
  today: string;
  onClose: () => void;
  onSaved: (saleId: string) => void;
};

// "উৎপাদন বিক্রি লিখুন" (board FarmSaleNew): what, from which batch, how much at what rate,
// to whom, and whether it was paid; the side shows what saving changes.
export function ProduceSaleDialog({ projectId, projectName, book, accounts, today, onClose, onSaved }: ProduceSaleDialogProps) {
  const t = useTranslations("Produce");
  const router = useRouter();
  const products = productsFor(book.farmType);
  const [first] = products;
  const [draft, setDraft] = useState<SaleDraft>({
    product: first![0],
    unit: first![1][0]!,
    phaseId: defaultBatch(book.batches),
    quantity: "",
    rate: "",
    buyer: "",
    date: today,
    fullPaid: true,
    got: "",
    accountId: accounts[0]?.id ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const change = (patch: Partial<SaleDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const units = products.find(([p]) => p === draft.product)?.[1] ?? [];
  const { amount, got, left } = figures(draft);
  const problem = submitted ? saleProblem(draft) : null;

  const batchChoices = [
    ...book.batches
      .filter(batchStarted)
      .reverse()
      .map((b) => ({ value: b.id, label: batchRunning(b) ? t("form.running", { name: b.name }) : b.name })),
    { value: "", label: t("form.noBatch") },
  ];
  const buyerChips = book.buyers.slice(0, 4).map((b) => {
    const due = book.dues.find((d) => d.buyerId === b.id)?.amount;
    return { name: b.name, label: due ? t("form.buyerDue", { name: b.name, amount: formatAmount(due) }) : b.name };
  });

  const save = () => {
    setSubmitted(true);
    if (saleProblem(draft)) return;
    startTransition(async () => {
      const result = await createProduceSaleAction(projectId, {
        product: draft.product,
        phaseId: draft.phaseId,
        quantity: Number(draft.quantity),
        unit: draft.unit,
        rate: Number(draft.rate),
        buyer: draft.buyer.trim(),
        date: draft.date,
        received: got,
        accountId: got > 0 ? draft.accountId : "",
      });
      if (!result.success) return void toast.error(result.message);
      toast.success(
        left > 0 ? t("form.doneLeft", { amount: formatAmount(amount), left: formatAmount(left) }) : t("form.done", { amount: formatAmount(amount) }),
      );
      onSaved(result.data.id);
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("form.title")}
      subtitle={projectName}
      closeLabel={t("form.close")}
      onClose={onClose}
      widthClass="max-w-215"
      topClass="top-9"
      bodyClass="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_270px]"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-danger">{problem ? t(`form.${problem}`) : ""}</span>
          <DialogButtons
            cancel={t("form.cancel")}
            submit={amount ? t("form.saveAmount", { amount: formatAmount(amount) }) : t("form.save")}
            onCancel={onClose}
            onSubmit={save}
            pending={isPending}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-3.5 px-6 pt-4 pb-4.5">
        <div className="flex flex-col gap-1.5">
          <span id="sp-title" className="text-[15px] font-semibold">
            {t("form.product")} <span className="text-danger">*</span>
          </span>
          <ChoiceChips
            labelledBy="sp-title"
            choices={products.map(([p]) => ({ value: p, label: t(`products.${p}`) }))}
            value={draft.product}
            onChange={(product) => change({ product, unit: products.find(([p]) => p === product)![1][0]! })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span id="sb-title" className="text-[15px] font-semibold">
            {t("form.batch")}
          </span>
          <ChoiceChips labelledBy="sb-title" shape="box" choices={batchChoices} value={draft.phaseId} onChange={(phaseId) => change({ phaseId })} />
        </div>
        <SaleAmountFields draft={draft} units={units} last={rateHint(book, draft)} submitted={submitted} onChange={change} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sbuy" className="text-[15px] font-semibold">
              {t("form.buyer")} <span className="font-normal text-ink-3">{t("form.buyerHint")}</span>
            </label>
            <input
              id="sbuy"
              type="text"
              placeholder={t("form.buyerPlaceholder")}
              value={draft.buyer}
              maxLength={80}
              onChange={(event) => change({ buyer: event.target.value })}
              aria-invalid={problem === "errBuyer"}
              className={cn(
                "box-border h-11 w-full rounded-[10px] bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:shadow-focus",
                problem === "errBuyer" ? "border-[1.5px] border-danger-strong" : "border border-line",
              )}
            />
            <div className="flex flex-wrap gap-1">
              {buyerChips.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => change({ buyer: c.name })}
                  className={cn(
                    "h-7 cursor-pointer rounded-full px-2.5 text-xs font-semibold text-ink",
                    draft.buyer === c.name ? "border-[1.5px] border-brand bg-brand-wash" : "border border-line bg-white",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sdate" className="text-[15px] font-semibold">
              {t("form.date")}
            </label>
            <DateField id="sdate" value={draft.date} onChange={(date) => change({ date })} />
          </div>
        </div>
        <SalePaidFields draft={draft} accounts={accounts} onChange={change} />
      </div>
      <SaleImpact book={book} draft={draft} accounts={accounts} />
    </FormDialog>
  );
}
