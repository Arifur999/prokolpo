"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMessages, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createExpenseAction, uploadMemoAction } from "@/app/(dashboardLayout)/projects/[projectId]/expenses/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ICategory } from "@/types/books.types";
import { AmountFields } from "./AmountFields";
import { CategoryChips } from "./CategoryChips";
import { DetailsFields } from "./DetailsFields";
import { amountOf, expenseErrors, partyIdOf, toPayload, type ExpenseValues } from "./expenseValues";
import { ImpactPanel } from "./ImpactPanel";
import { PartyFields, type Party, type PhaseOption } from "./PartyFields";
import { PaymentFields, type AccountOption } from "./PaymentFields";

export type ExpenseFormData = {
  projectId: string;
  categories: ICategory[];
  suppliers: Party[];
  contractors: Party[];
  phases: PhaseOption[];
  accounts: AccountOption[];
  categoryTotals: Record<string, number>;
};

type NewExpenseFormProps = ExpenseFormData & { defaults: ExpenseValues };

// Board ExpenseNew: the bill on the left, what saving it does on the right.
export function NewExpenseForm({ defaults, ...data }: NewExpenseFormProps) {
  const t = useTranslations("ExpenseForm");
  const v = useMessages().ExpenseForm.validation;
  const router = useRouter();
  const [values, setValues] = useState(defaults);
  const [memo, setMemo] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const set = (patch: Partial<ExpenseValues>) => setValues((current) => ({ ...current, ...patch }));

  const errors = expenseErrors(values);
  const show = (key: keyof typeof errors, message: string) => (submitted && errors[key] ? message : undefined);
  const parties = values.partyKind === "SUPPLIER" ? data.suppliers : values.partyKind === "CONTRACTOR" ? data.contractors : [];
  const party = parties.find((p) => p.id === partyIdOf(values)) ?? null;
  const category = data.categories.find((c) => c.id === values.categoryId);
  const phase = data.phases.find((p) => p.id === values.phaseId) ?? null;
  const account = data.accounts.find((a) => a.id === values.accountId) ?? null;

  const save = (another: boolean) => {
    setSubmitted(true);
    if (Object.keys(errors).length || isPending) return;
    startTransition(async () => {
      const result = await createExpenseAction(data.projectId, toPayload(values));
      if (!result.success) return void toast.error(result.message);
      if (memo) {
        const form = new FormData();
        form.set("memo", memo);
        const uploaded = await uploadMemoAction(data.projectId, result.data.id, form);
        if (!uploaded.success) toast.error(uploaded.message);
      }
      const amount = formatAmount(result.data.amount);
      if (another) {
        // Keep what the next bill most likely shares: head, unit, phase and who it is from.
        setValues((current) => ({ ...current, quantity: "", rate: "", amount: "", amountManual: false, description: "" }));
        setMemo(null);
        setSubmitted(false);
        toast.success(t("savedNext", { amount }));
        router.refresh();
        return;
      }
      toast.success(t("saved", { amount }));
      router.push(projectHref(data.projectId, "expenses"));
    });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save(false);
        }}
        className="flex flex-col rounded-2xl border border-line-2 bg-white"
      >
        <CategoryChips
          projectId={data.projectId}
          categories={data.categories}
          value={values.categoryId}
          onChange={(categoryId) => set({ categoryId })}
          error={show("categoryId", v.category)}
        />
        <AmountFields values={values} set={set} error={show("amount", v.amount)} />
        <PartyFields
          projectId={data.projectId}
          values={values}
          set={set}
          suppliers={data.suppliers}
          contractors={data.contractors}
          phases={data.phases}
          error={show("partyId", v.party)}
        />
        <DetailsFields values={values} set={set} memo={memo} onMemo={setMemo} />
        <PaymentFields values={values} set={set} accounts={data.accounts} partyName={party?.name ?? null} />

        <div className="flex flex-wrap items-center justify-end gap-3 rounded-b-2xl border-t border-line-2 bg-surface-3 px-5 py-5 sm:px-7">
          <Link
            href={projectHref(data.projectId, "expenses")}
            className="box-border flex h-12 items-center rounded-xl border border-line bg-white px-4.5 text-[15px] font-semibold text-ink no-underline hover:text-ink"
          >
            {t("cancel")}
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(true)}
            className="h-12 cursor-pointer rounded-xl border border-brand bg-white px-4.5 text-[15px] font-semibold text-brand disabled:cursor-wait"
          >
            {t("saveAnother")}
          </button>
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className={cn(
              "flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border-none px-5.5 text-[15px] font-semibold text-white",
              isPending ? "cursor-wait bg-brand-busy" : "bg-brand",
            )}
          >
            {isPending && <Icon name="spinner" size={20} strokeWidth={2.4} className="animate-spin" />}
            {t(isPending ? "saving" : "save")}
          </button>
        </div>
      </form>

      <ImpactPanel
        values={{ ...values, amount: String(amountOf(values)) }}
        party={party}
        account={account}
        phase={phase}
        categoryName={category?.name ?? ""}
        categoryTotal={category ? (data.categoryTotals[category.name] ?? 0) : 0}
      />
    </div>
  );
}
