"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePaymentAction } from "@/app/(dashboardLayout)/projects/[projectId]/suppliers/_action";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { Segmented } from "@/components/shared/Segmented";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ILedgerLine } from "@/types/books.types";

type Filter = "all" | "BILL" | "PAYMENT";

type SupplierLedgerTableProps = {
  projectId: string;
  lines: ILedgerLine[];
  canWrite: boolean;
};

const cell = "border-b border-line-3 px-4 py-3";
const KIND_PILL = { BILL: "bg-surface-4 text-ink-2", PAYMENT: "bg-brand-tint text-success", OPENING: "bg-surface-4 text-ink-2" } as const;

// "লেনদেনের খাতা": every bill and payment, oldest first, with the running due (board Ledger).
export function SupplierLedgerTable({ projectId, lines, canWrite }: SupplierLedgerTableProps) {
  const t = useTranslations("Ledger");
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [removing, setRemoving] = useState<ILedgerLine | null>(null);
  const [isPending, startTransition] = useTransition();
  const shown = lines.filter((line) => filter === "all" || line.kind === filter || (filter === "BILL" && line.kind === "OPENING"));
  const sum = (key: "charge" | "payment") => shown.reduce((total, line) => total + line[key], 0);
  const last = lines.at(-1);
  const taka = (n: number) => (n < 0 ? t("advance", { amount: formatAmount(-n) }) : formatAmount(n));

  const remove = (line: ILedgerLine) =>
    startTransition(async () => {
      const result = await deletePaymentAction(projectId, line.ref);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("deleted"));
      setRemoving(null);
      router.refresh();
    });

  return (
    <section aria-labelledby="ledger-title" className="flex grow flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex flex-col gap-0.5">
          <h2 id="ledger-title" className="m-0 text-[17px] leading-[1.4] font-semibold">
            {t("tableTitle")}
          </h2>
          <p className="m-0 text-sm text-ink-2">{t("tableSub")}</p>
        </div>
        <Segmented
          label={t("kindLabel")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("all") },
            { value: "BILL", label: t("bills") },
            { value: "PAYMENT", label: t("payments") },
          ]}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-200 border-collapse text-[15px]">
          <thead>
            <tr className="bg-surface-2 text-left text-[13px] font-semibold text-ink-2">
              <th scope="col" className="w-32 border-y border-line-2 py-3 pr-4 pl-6 font-semibold">
                {t("date")}
              </th>
              <th scope="col" className="border-y border-line-2 px-4 py-3 font-semibold">
                {t("description")}
              </th>
              <th scope="col" className="w-27.5 border-y border-line-2 px-4 py-3 font-semibold">
                {t("kind")}
              </th>
              <th scope="col" className="w-32.5 border-y border-line-2 px-4 py-3 text-right font-semibold">
                {t("bill")}
              </th>
              <th scope="col" className="w-32.5 border-y border-line-2 px-4 py-3 text-right font-semibold">
                {t("payment")}
              </th>
              <th scope="col" className="w-42.5 border-y border-line-2 px-4 py-3 text-right font-semibold">
                {t("running")}
              </th>
              <th scope="col" className="w-15 border-y border-line-2 py-3 pr-6 pl-2">
                <span className="sr-only">{t("options")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((line) =>
              line.kind === "OPENING" ? (
                <tr key={line.ref} className="bg-surface-3">
                  <td className={cn(cell, "pl-6 text-ink-3")}>—</td>
                  <td className={cell}>
                    <span className="font-semibold">{t("opening")}</span> <span className="text-[13px] text-ink-3">· {line.detail ?? t("openingSub")}</span>
                  </td>
                  <td className={cell} />
                  <td className={cn(cell, "text-right")}>{formatAmount(line.charge)}</td>
                  <td className={cell} />
                  <td className={cn(cell, "text-right font-semibold")}>{taka(line.due)}</td>
                  <td className={cn(cell, "pr-6")} />
                </tr>
              ) : (
                <tr key={line.ref}>
                  <td className={cn(cell, "pl-6 whitespace-nowrap text-ink-2")}>{dayFirst(line.date)}</td>
                  <td className={cell}>
                    <span className="flex flex-col">
                      <span className="font-medium">{line.kind === "BILL" ? line.title : t("paymentTitle")}</span>
                      <span className="text-[13px] text-ink-3">
                        {line.kind === "BILL"
                          ? line.detail
                          : [line.account && t("fromAccount", { account: line.account }), line.detail].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </td>
                  <td className={cell}>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[13px] font-semibold", KIND_PILL[line.kind as "BILL" | "PAYMENT"])}>
                      {t(`kind${line.kind as "BILL" | "PAYMENT"}`)}
                    </span>
                  </td>
                  <td className={cn(cell, "text-right", !line.charge && "text-ink-disabled")}>{line.charge ? formatAmount(line.charge) : "—"}</td>
                  <td className={cn(cell, "text-right", !line.payment && "text-ink-disabled")}>{line.payment ? formatAmount(line.payment) : "—"}</td>
                  <td className={cn(cell, "text-right font-semibold", line.due === 0 && "text-success")}>{line.due === 0 ? t("settled") : taka(line.due)}</td>
                  <td className={cn(cell, "pr-6 pl-2")}>
                    {canWrite && (
                      <DropdownMenu.Root modal={false}>
                        <DropdownMenu.Trigger
                          aria-label={t("more")}
                          className="flex size-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-3 hover:bg-surface-2"
                        >
                          <Icon name="moreVertical" size={18} strokeWidth={2} />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={4}
                            className="z-40 flex w-48 flex-col rounded-xl border border-line-2 bg-white p-1.5 shadow-raised"
                          >
                            {line.kind === "BILL" ? (
                              <DropdownMenu.Item
                                asChild
                                className="flex h-10 cursor-pointer items-center rounded-lg px-2.5 text-[15px] text-ink no-underline outline-none hover:text-ink data-highlighted:bg-surface-2"
                              >
                                <Link href={projectHref(projectId, `expenses/${line.ref}`)}>{t("editBill")}</Link>
                              </DropdownMenu.Item>
                            ) : (
                              <DropdownMenu.Item
                                onSelect={() => setRemoving(line)}
                                className="flex h-10 cursor-pointer items-center rounded-lg px-2.5 text-[15px] text-danger outline-none data-highlighted:bg-surface-2"
                              >
                                {t("deletePayment")}
                              </DropdownMenu.Item>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </td>
                </tr>
              ),
            )}
            {shown.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-ink-3">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
          {shown.length > 0 && (
            <tfoot>
              <tr className="bg-surface-2">
                <td className="border-t border-line-2 py-4 pr-4 pl-6" />
                <td className="border-t border-line-2 p-4 font-semibold">{t("total")}</td>
                <td className="border-t border-line-2 p-4" />
                <td className="border-t border-line-2 p-4 text-right font-semibold">{formatAmount(sum("charge"))}</td>
                <td className="border-t border-line-2 p-4 text-right font-semibold">{formatAmount(sum("payment"))}</td>
                <td className="border-t border-line-2 p-4 text-right font-bold">{taka(last?.due ?? 0)}</td>
                <td className="border-t border-line-2 py-4 pr-6 pl-2" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {removing && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setRemoving(null)}
          icon="trash"
          tone="danger"
          title={t("deleteTitle")}
          subtitle={t("deleteBody", { amount: formatAmount(removing.payment), date: dayFirst(removing.date) })}
          cancelLabel={t("cancel")}
          confirmLabel={t("confirmDelete")}
          pending={isPending}
          onConfirm={() => remove(removing)}
        />
      )}
    </section>
  );
}
