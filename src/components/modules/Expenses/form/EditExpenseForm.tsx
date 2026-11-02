"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMessages, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteExpenseAction, updateExpenseAction, uploadMemoAction } from "@/app/(dashboardLayout)/projects/[projectId]/expenses/_action";
import { FormSection } from "@/components/shared/form/FormSection";
import { TextInput } from "@/components/shared/form/TextInput";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IExpense } from "@/types/books.types";
import { DeleteExpenseDialog, type BookTotals } from "../DeleteExpenseDialog";
import { AmountFields } from "./AmountFields";
import { CategoryChips } from "./CategoryChips";
import { DetailsFields } from "./DetailsFields";
import { amountOf, expenseErrors, partyIdOf, toPayload, valuesFromExpense, type ExpenseValues } from "./expenseValues";
import { ImpactPanel, type Change } from "./ImpactPanel";
import type { ExpenseFormData } from "./NewExpenseForm";
import { PartyFields } from "./PartyFields";

type EditExpenseFormProps = ExpenseFormData & {
  expense: IExpense;
  totals: BookTotals;
  memoHref: string | null;
};

// Board ExpenseEdit: the same fields as a new bill, what changes listed as before → after,
// a reason for the activity log, and payments left as they were.
export function EditExpenseForm({ expense, totals, memoHref, ...data }: EditExpenseFormProps) {
  const t = useTranslations("ExpenseForm");
  const v = useMessages().ExpenseForm.validation;
  const router = useRouter();
  const initial = valuesFromExpense(expense);
  const [values, setValues] = useState<ExpenseValues>(initial);
  const [memo, setMemo] = useState<File | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const set = (patch: Partial<ExpenseValues>) => setValues((current) => ({ ...current, ...patch }));

  const errors = expenseErrors(values);
  const parties = values.partyKind === "SUPPLIER" ? data.suppliers : values.partyKind === "CONTRACTOR" ? data.contractors : [];
  const party = parties.find((p) => p.id === partyIdOf(values)) ?? null;
  const category = data.categories.find((c) => c.id === values.categoryId);
  const phase = data.phases.find((p) => p.id === values.phaseId) ?? null;
  const account = data.accounts.find((a) => a.name === expense.paidAccount) ?? null;

  const changes = listChanges(initial, values, memo, data, t);
  const save = () => {
    if (Object.keys(errors).length || isPending) return;
    startTransition(async () => {
      if (changes.some((c) => c.field !== "memo")) {
        const result = await updateExpenseAction(data.projectId, expense.id, toPayload(values));
        if (!result.success) return void toast.error(result.message);
      }
      if (memo) {
        const form = new FormData();
        form.set("memo", memo);
        const uploaded = await uploadMemoAction(data.projectId, expense.id, form);
        if (!uploaded.success) return void toast.error(uploaded.message);
      }
      toast.success(t("edit.saved", { fields: changes.map((c) => c.label).join(", ") }));
      router.push(projectHref(data.projectId, "expenses"));
    });
  };

  const remove = (_: IExpense, reason: string) =>
    startTransition(async () => {
      const result = await deleteExpenseAction(data.projectId, expense.id, reason);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("edit.deleted"));
      router.push(projectHref(data.projectId, "expenses"));
    });

  const ledgerPage = expense.supplierId ? `suppliers/${expense.supplierId}` : expense.contractorId ? `contractors/${expense.contractorId}` : "accounts";

  return (
    <>
      {expense.paidOnBill > 0 && (
        <p className="m-0 -mt-2 flex items-start gap-2.5 rounded-xl border border-gold-line bg-gold-wash px-3.5 py-3 text-sm leading-[1.55] text-gold-deep">
          <Icon name="alertTriangle" size={18} strokeWidth={2} className="mt-0.5" />
          <span>{t("edit.paidBanner", { amount: formatAmount(expense.paidOnBill) })}</span>
        </p>
      )}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="flex flex-col rounded-2xl border border-line-2 bg-white"
        >
          <CategoryChips
            projectId={data.projectId}
            categories={data.categories}
            value={values.categoryId}
            onChange={(categoryId) => set({ categoryId })}
            error={errors.categoryId ? v.category : undefined}
          />
          <AmountFields values={values} set={set} error={errors.amount ? v.amount : undefined} />
          <PartyFields
            projectId={data.projectId}
            values={values}
            set={set}
            suppliers={data.suppliers}
            contractors={data.contractors}
            phases={data.phases}
            error={errors.partyId ? v.party : undefined}
          />
          <DetailsFields values={values} set={set} memo={memo} onMemo={setMemo} memoHref={memoHref} />

          <FormSection id="ex-pay-title" inset="md" title={t("payTitle")} className="gap-2.5">
            <div className="flex items-center gap-3.5 rounded-xl bg-surface-2 px-4 py-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-success">
                <Icon name="banknote" size={18} />
              </span>
              <span className="flex grow flex-col">
                <span className="text-[15px] font-semibold">
                  {expense.paidNow
                    ? t("edit.paidCash", { account: expense.paidAccount ?? "" })
                    : t("edit.paidCredit", { amount: formatAmount(expense.paidOnBill) })}
                </span>
              </span>
              {!expense.paidNow && (
                <Link href={projectHref(data.projectId, ledgerPage)} className="text-sm font-semibold whitespace-nowrap no-underline">
                  {t("edit.openLedger")}
                </Link>
              )}
            </div>
            <span className="text-[13px] text-ink-3">{t("edit.paymentReadOnly")}</span>
          </FormSection>

          <FormSection
            id="ex-why-title"
            inset="md"
            className="gap-2"
            title={
              <label htmlFor="ex-why">
                {t("edit.reason")} <span className="text-[15px] font-normal text-ink-3">{t("optional")}</span>
              </label>
            }
          >
            <TextInput
              id="ex-why"
              maxLength={500}
              value={values.reason}
              onChange={(event) => set({ reason: event.target.value })}
              placeholder={t("edit.reasonPlaceholder")}
              className="h-11.5 text-[15px]"
            />
            <span className="text-[13px] text-ink-3">{t("edit.reasonHelp")}</span>
          </FormSection>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line-2 bg-surface-3 px-5 py-4.5 sm:px-7">
            <button
              type="button"
              onClick={() => setDeleting(true)}
              className="flex h-12 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-transparent px-3.5 text-[15px] font-semibold text-danger"
            >
              <Icon name="trash" size={18} strokeWidth={2} />
              {t("edit.delete")}
            </button>
            <div className="flex gap-3">
              <Link
                href={projectHref(data.projectId, "expenses")}
                className="box-border flex h-12 items-center rounded-xl border border-line bg-white px-4.5 text-[15px] font-semibold text-ink no-underline hover:text-ink"
              >
                {t("cancel")}
              </Link>
              <button
                type="submit"
                disabled={isPending || changes.length === 0 || Object.keys(errors).length > 0}
                aria-busy={isPending}
                className={cn(
                  "flex h-12 cursor-pointer items-center gap-2.5 rounded-xl border-none px-5.5 text-[15px] font-semibold text-white disabled:cursor-default",
                  changes.length === 0 ? "bg-ink-5" : isPending ? "bg-brand-busy" : "bg-brand",
                )}
              >
                {isPending && <Icon name="spinner" size={20} strokeWidth={2.4} className="animate-spin" />}
                {changes.length ? t("edit.save", { count: changes.length }) : t("edit.saveNone")}
              </button>
            </div>
          </div>
        </form>

        <ImpactPanel
          values={values}
          original={{
            amount: expense.amount,
            partyId: expense.supplierId ?? expense.contractorId ?? "",
            phaseId: expense.phaseId ?? "",
            categoryName: expense.categoryName,
            paidNow: expense.paidNow,
            paidOnBill: expense.paidOnBill,
          }}
          changes={changes}
          party={party}
          account={account}
          phase={phase}
          categoryName={category?.name ?? ""}
          categoryTotal={category ? (data.categoryTotals[category.name] ?? 0) : 0}
        />
      </div>

      {deleting && <DeleteExpenseDialog expense={expense} totals={totals} pending={isPending} onClose={() => setDeleting(false)} onConfirm={remove} />}
    </>
  );
}

type ChangedField = "category" | "quantity" | "rate" | "amount" | "party" | "phase" | "date" | "description" | "memo";
type FieldChange = Change & { field: ChangedField };

// The fields an edit changed, worded for the side panel and the toast.
const listChanges = (
  before: ExpenseValues,
  after: ExpenseValues,
  memo: File | null,
  data: ExpenseFormData,
  t: ReturnType<typeof useTranslations<"ExpenseForm">>,
): FieldChange[] => {
  const name = (list: { id: string; name: string }[], id: string) => list.find((item) => item.id === id)?.name ?? "";
  const partyName = (v: ExpenseValues) =>
    v.partyKind === "NONE" ? t("kindNONE") : name(v.partyKind === "SUPPLIER" ? data.suppliers : data.contractors, partyIdOf(v));
  const quantity = (v: ExpenseValues) => (v.quantity ? `${v.quantity} ${v.unit}` : "");
  const taka = (n: number | string) => (Number(n) ? `৳ ${formatAmount(Number(n))}` : "");
  const pairs: [ChangedField, string, string][] = [
    ["category", name(data.categories, before.categoryId), name(data.categories, after.categoryId)],
    ["quantity", quantity(before), quantity(after)],
    ["rate", taka(before.rate), taka(after.rate)],
    ["amount", taka(amountOf(before)), taka(amountOf(after))],
    ["party", partyName(before), partyName(after)],
    ["phase", name(data.phases, before.phaseId), name(data.phases, after.phaseId)],
    ["date", dayFirst(before.date), dayFirst(after.date)],
    ["description", before.description.trim(), after.description.trim()],
  ];
  const changes = pairs.filter(([, b, a]) => b !== a).map(([field, b, a]) => ({ field, label: t(`fields.${field}`), before: b, after: a }));
  if (memo) changes.push({ field: "memo", label: t("fields.memo"), before: "", after: memo.name });
  return changes;
};
