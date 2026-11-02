"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { nameInitials } from "@/lib/memberLook";
import { formatAmount } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import type { ISaleDetail } from "@/types/sales.types";

const day = (iso: string) => dayFirst(iso.slice(0, 10));

// Beside the installments (board SaleDetail): the buyer, the terms, and a reminder to send.
export function SaleSide({ projectId, projectName, detail, from }: { projectId: string; projectName: string; detail: ISaleDetail; from: string }) {
  const t = useTranslations("SaleDetail");
  const { sale, rows } = detail;
  const st = sale.standing;
  const first = rows[0];
  const last = rows.at(-1);
  const focus = st.late ?? st.next;
  const parts =
    last && first && last.amount !== first.amount
      ? `${rows.length - 1} × ${formatAmount(first.amount)} + ${formatAmount(last.amount)}`
      : `${rows.length} × ${formatAmount(sale.installment)}`;
  const reminder =
    st.due > 0 && focus
      ? t("reminder", {
          name: sale.customer,
          project: projectName,
          unit: sale.unitName,
          no: focus.no,
          amount: formatAmount(focus.amount),
          date: day(focus.date),
          due: formatAmount(st.due),
          from,
        })
      : t("noReminder", { name: sale.customer });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reminder);
      toast.success(t("copied"));
    } catch {
      toast.error(reminder);
    }
  };

  const card = "flex flex-col rounded-2xl border border-line-2 bg-white px-5 py-4.5";
  return (
    <div className="flex flex-col gap-4.5">
      <section aria-labelledby="cu-title" className={`${card} gap-3.5`}>
        <h2 id="cu-title" className="m-0 text-base font-semibold">
          {t("buyer")}
        </h2>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[15px] font-bold text-brand">
            {nameInitials(sale.customer)}
          </span>
          <span className="flex flex-col">
            <span className="text-base font-semibold">{sale.customer}</span>
            <span className="text-[13px] text-ink-2">{displayPhone(sale.phone)}</span>
          </span>
        </div>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-ink-3">{t("nid")}</dt>
          <dd className="m-0 text-right">{detail.nid ?? "—"}</dd>
          <dt className="text-ink-3">{t("address")}</dt>
          <dd className="m-0 text-right">{detail.address ?? "—"}</dd>
        </dl>
        <Link
          href={projectHref(projectId, `customers/${sale.customerId}`)}
          className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-line text-sm font-semibold text-ink no-underline"
        >
          {t("profile")}
          <Icon name="chevronRight" size={16} strokeWidth={2} />
        </Link>
      </section>
      {sale.installments > 0 && first && last && (
        <section aria-labelledby="tr-title" className={`${card} gap-2.5`}>
          <h2 id="tr-title" className="m-0 text-base font-semibold">
            {t("terms")}
          </h2>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-ink-3">{t("termsDown")}</dt>
            <dd className="m-0 text-right font-semibold">৳ {formatAmount(sale.down)}</dd>
            <dt className="text-ink-3">{t("termsKist")}</dt>
            <dd className="m-0 text-right font-semibold">{t("termsKistValue", { count: sale.installments, amount: formatAmount(sale.installment) })}</dd>
            <dt className="text-ink-3">{t("termsWhen")}</dt>
            <dd className="m-0 text-right">{t(`every${sale.intervalMonths as 1 | 3 | 6}`, { day: Number(first.due.slice(8, 10)) })}</dd>
            <dt className="text-ink-3">{t("termsSpan")}</dt>
            <dd className="m-0 text-right">
              {day(first.due)} · {day(last.due)}
            </dd>
          </dl>
          <p className="m-0 rounded-lg bg-brand-wash px-2.5 py-2 text-[13px] text-brand">
            {t("check", { down: formatAmount(sale.down), parts, total: formatAmount(sale.price) })}
          </p>
        </section>
      )}
      <section aria-labelledby="rm-title" className={`${card} gap-3`}>
        <div className="flex flex-col gap-0.5">
          <h2 id="rm-title" className="m-0 text-base font-semibold">
            {t("reminderTitle")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("reminderNote")}</span>
        </div>
        <p className="m-0 rounded-xl border border-success-line bg-brand-wash px-3.5 py-3 text-sm leading-[1.65] whitespace-pre-line">{reminder}</p>
        <button
          type="button"
          disabled={st.due <= 0}
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
