"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatPercent } from "@/lib/money";
import { dueOf, owedBy, percentText } from "@/lib/partnerMath";
import { cn } from "@/lib/utils";
import type { IPartnerDetail } from "@/types/partners.types";

// Beside a partner's ledger (board PartnerDetail): what is owed for what, and a reminder to send.
export function PartnerSidePanels({ detail, projectName, from }: { detail: IPartnerDetail; projectName: string; from: string }) {
  const t = useTranslations("Partners.detail");
  const p = detail.partner;
  const due = dueOf(p);
  const paidMain = detail.entries.filter((e) => e.kind === "PAID" && !e.callId).reduce((sum, e) => sum + e.amount, 0);
  const parts = [
    { key: "main", label: t("mainTitle"), total: p.committed, paid: paidMain },
    ...detail.calls.map((c) => {
      const part = c.parts.find((x) => x.partnerId === p.id);
      return { key: c.id, label: t("callTitle", { date: dayFirst(c.date.slice(0, 10)).slice(0, 5) }), total: part?.amount ?? 0, paid: part?.paid ?? 0 };
    }),
  ];
  const ofProject = detail.projectPaid ? (p.paid / detail.projectPaid) * 100 : 0;
  const reminder =
    due > 0
      ? t("reminder", { name: p.name, project: projectName, should: formatAmount(owedBy(p)), paid: formatAmount(p.paid), due: formatAmount(due), from })
      : t("noReminder", { name: p.name });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reminder);
      toast.success(t("copied"));
    } catch {
      toast.error(reminder);
    }
  };

  return (
    <div className="flex flex-col gap-4.5">
      <section aria-labelledby="bk-title" className="flex flex-col gap-3.5 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
        <h2 id="bk-title" className="m-0 text-base font-semibold">
          {t("partsTitle")}
        </h2>
        {parts.map((part) => {
          const left = part.total - part.paid;
          return (
            <div key={part.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold">{part.label}</span>
                <span className="text-[13px] text-ink-3">৳ {formatAmount(part.total)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line-3">
                <span
                  className="block h-full rounded-full bg-brand-mid"
                  style={{ width: `${part.total ? Math.min(100, (part.paid / part.total) * 100).toFixed(1) : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-ink-2">{t("partPaid", { amount: formatAmount(part.paid) })}</span>
                <strong className={cn("font-semibold", left > 0 ? "text-gold-ink" : "text-success")}>
                  {left > 0 ? t("partDue", { amount: formatAmount(left) }) : t("settled")}
                </strong>
              </div>
            </div>
          );
        })}
        <p className="m-0 rounded-[10px] bg-surface-2 px-3 py-2.5 text-[13px] leading-[1.6] text-ink-2">
          {due > 0 ? t("shareNoteDue", { share: percentText(p.share), percent: formatPercent(ofProject) }) : t("shareNoteDone")}
        </p>
      </section>
      <section aria-labelledby="rm-title" className="flex flex-col gap-3 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
        <div className="flex flex-col gap-0.5">
          <h2 id="rm-title" className="m-0 text-base font-semibold">
            {t("reminderTitle")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("reminderNote")}</span>
        </div>
        <p className="m-0 rounded-xl border border-success-line bg-brand-wash px-3.5 py-3 text-sm leading-[1.65] whitespace-pre-line text-ink">{reminder}</p>
        <button
          type="button"
          disabled={due <= 0}
          onClick={() => void copy()}
          className="flex h-10.5 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-brand bg-white text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="copy" size={16} strokeWidth={2} />
          {t("copy")}
        </button>
      </section>
    </div>
  );
}
