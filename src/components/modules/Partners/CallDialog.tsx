"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCallAction } from "@/app/(dashboardLayout)/projects/[projectId]/partners/_action";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { TextInput } from "@/components/shared/form/TextInput";
import { Icon } from "@/components/shared/icon/Icon";
import { useAmountWords } from "@/hooks/useAmountWords";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { dueOf, percentText, splitCall, toTenths } from "@/lib/partnerMath";
import type { IPartner } from "@/types/partners.types";
import { ShareSwatch } from "./PartnerAvatar";

const ROW = "grid grid-cols-[minmax(0,1fr)_56px_110px_100px_110px] items-center gap-2 px-4 sm:grid-cols-[minmax(0,1fr)_70px_140px_120px_140px]";

type CallDialogProps = { projectId: string; projectName: string; partners: IPartner[]; today: string; onClose: () => void };

// "নতুন ক্যাপিটাল কল" (board PartnerCapitalCall): a total and a reason; each partner's part
// by share, with what they will owe after it.
export function CallDialog({ projectId, projectName, partners, today, onClose }: CallDialogProps) {
  const t = useTranslations("Partners.call");
  const tp = useTranslations("Partners");
  const words = useAmountWords();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const total = Number(amount || 0);
  const parts = splitCall(
    total,
    partners.map((p) => toTenths(p.share)),
  );
  const dueBefore = partners.reduce((sum, p) => sum + Math.max(0, dueOf(p)), 0);
  const monthEnd = (() => {
    const [y, m] = today.split("-").map(Number);
    return new Date(Date.UTC(y ?? 2026, m ?? 1, 0)).toISOString().slice(0, 10);
  })();
  const error = submitted ? (!total ? t("amountError") : !reason.trim() ? t("reasonError") : null) : null;

  const copy = async () => {
    const lines = partners.map((p, i) => t("messageLine", { name: p.name, amount: formatAmount(parts[i] ?? 0) })).join("\n");
    try {
      await navigator.clipboard.writeText(
        t("message", { project: projectName, total: formatAmount(total), reason: reason.trim(), lines, due: dayFirst(monthEnd) }),
      );
      toast.success(t("copied"));
    } catch {
      toast.error(t("amountError"));
    }
  };

  const save = () => {
    setSubmitted(true);
    if (!total || !reason.trim()) return;
    startTransition(async () => {
      const result = await createCallAction(projectId, total, reason.trim());
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { amount: formatAmount(total) }));
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
      widthClass="max-w-180"
      topClass="top-12"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            disabled={!total}
            onClick={() => void copy()}
            className="flex h-10.5 cursor-pointer items-center gap-1.5 rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-ink"
          >
            <Icon name="copy" size={16} strokeWidth={2} />
            {t("copy")}
          </button>
          <DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />
        </div>
      }
    >
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <label htmlFor="call-amount" className="text-[15px] font-semibold">
            {t("amount")} <span className="text-danger">*</span>
          </label>
          <MoneyInput
            id="call-amount"
            autoFocus
            aria-required="true"
            placeholder="0"
            value={amount}
            onChange={setAmount}
            invalid={submitted && !total}
            wrapperClassName="h-14 gap-2.5 rounded-xl border-2 border-brand px-4"
            className="text-[22px] font-bold"
          />
          <span className="text-[13px] font-semibold text-success">{words(total)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="call-reason" className="text-[15px] font-semibold">
            {t("reason")} <span className="text-danger">*</span>
          </label>
          <TextInput id="call-reason" maxLength={200} placeholder={t("reasonPlaceholder")} value={reason} onChange={(event) => setReason(event.target.value)} />
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-ink-2">{t("date")}</span>
              <span className="text-[15px]">{dayFirst(today)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-ink-2">{t("due")}</span>
              <span className="text-[15px]">{dayFirst(monthEnd)}</span>
            </div>
          </div>
        </div>
      </div>

      <div role="table" aria-label={t("partsLabel")} className="flex flex-col overflow-x-auto rounded-xl border border-line-2">
        <div role="row" className={`${ROW} h-9.5 bg-surface-2 text-[13px] font-semibold text-ink-2`}>
          <span role="columnheader">{tp("colPartner")}</span>
          <span role="columnheader">{tp("colShare")}</span>
          <span role="columnheader" className="text-right">
            {t("colPart")}
          </span>
          <span role="columnheader" className="text-right">
            {t("colBefore")}
          </span>
          <span role="columnheader" className="text-right">
            {t("colAfter")}
          </span>
        </div>
        {partners.map((p, i) => {
          const before = Math.max(0, dueOf(p));
          return (
            <div key={p.id} role="row" className={`${ROW} min-h-11 border-t border-line-3 text-sm`}>
              <span role="cell" className="flex items-center gap-2 font-semibold">
                <ShareSwatch color={p.color} />
                {p.name}
              </span>
              <span role="cell" className="text-ink-2">
                {percentText(p.share)}
              </span>
              <span role="cell" className="text-right text-[15px] font-bold text-brand">
                ৳ {formatAmount(parts[i] ?? 0)}
              </span>
              <span role="cell" className="text-right text-ink-3">
                {formatAmount(before)}
              </span>
              <span role="cell" className="text-right font-semibold">
                ৳ {formatAmount(before + (parts[i] ?? 0))}
              </span>
            </div>
          );
        })}
        <div role="row" className={`${ROW} min-h-10.5 border-t border-line-2 bg-surface-2 text-sm font-bold`}>
          <span role="cell">{t("total")}</span>
          <span role="cell">100%</span>
          <span role="cell" className="text-right">
            ৳ {formatAmount(total)}
          </span>
          <span role="cell" className="text-right">
            {formatAmount(dueBefore)}
          </span>
          <span role="cell" className="text-right">
            ৳ {formatAmount(dueBefore + total)}
          </span>
        </div>
      </div>
      {error && <p className="m-0 text-sm text-danger">{error}</p>}
      <p className="m-0 flex items-start gap-2 text-[13px] leading-[1.55] text-ink-2">
        <Icon name="info" size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
        {t("note")}
      </p>
    </FormDialog>
  );
}
