"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatPercent } from "@/lib/money";
import { dueOf, owedBy, partnerColor, percentText } from "@/lib/partnerMath";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IPartnerDetail } from "@/types/partners.types";
import { DepositDialog } from "./DepositDialog";
import { PartnerAvatar } from "./PartnerAvatar";
import { PartnerLedger } from "./PartnerLedger";
import { PartnerSidePanels } from "./PartnerSidePanels";

type PartnerDetailViewProps = {
  projectId: string;
  projectName: string;
  detail: IPartnerDetail;
  accounts: PickableAccount[];
  canWrite: boolean;
  from: string;
};

// One partner's page (board PartnerDetail): who they are, what they owe and paid, the
// ledger, and a reminder to send.
export function PartnerDetailView({ projectId, projectName, detail, accounts, canWrite, from }: PartnerDetailViewProps) {
  const t = useTranslations("Partners.detail");
  const tp = useTranslations("Partners");
  const [depositing, setDepositing] = useState(false);
  const p = detail.partner;
  const should = owedBy(p);
  const due = dueOf(p);
  const percent = should ? (p.paid / should) * 100 : 0;
  const lastPaid = detail.entries.filter((e) => e.kind === "PAID").at(-1);
  const color = partnerColor(p.color);
  const app =
    p.role === "VIEWER"
      ? t("appViewer")
      : p.role
        ? t("appRole", { role: tp(`tag.${p.role}`) })
        : p.invited
          ? t("appInvited")
          : p.hasAccount
            ? t("appAccount")
            : t("appNone");

  return (
    <>
      <div className="flex flex-col gap-4">
        <nav aria-label={tp("title")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={projectHref(projectId, "partners")} className="text-ink-2 no-underline">
            {tp("title")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {p.name}
          </span>
        </nav>
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <PartnerAvatar name={p.name} color={p.color} size="lg" />
            <div className="flex flex-col gap-1">
              <h1 className="m-0 flex flex-wrap items-center gap-2.5 text-2xl leading-[1.3] font-semibold lg:text-[28px]">
                {p.name}
                <span
                  className="rounded-full px-2.5 py-px text-sm font-bold"
                  style={{ background: `color-mix(in srgb, ${color} 14%, white)`, color: `color-mix(in srgb, ${color} 65%, black)` }}
                >
                  {t("share", { share: percentText(p.share) })}
                </span>
              </h1>
              <p className="m-0 flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm text-ink-2">
                <span className="flex items-center gap-1.5">
                  <Icon name="phone" size={15} strokeWidth={2} />
                  {displayPhone(p.phone)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="smartphone" size={15} strokeWidth={2} />
                  {app}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={15} strokeWidth={2} />
                  {t("joined", { date: dayFirst(p.joinedOn.slice(0, 10)) })}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-line bg-white px-4 text-[15px] font-semibold text-ink"
            >
              <Icon name="printer" size={18} strokeWidth={2} />
              {t("print")}
            </button>
            {canWrite && (
              <button
                type="button"
                onClick={() => setDepositing(true)}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
              >
                <Icon name="banknote" size={18} strokeWidth={2} />
                {tp("takeDeposit")}
              </button>
            )}
          </div>
        </header>
      </div>

      <section aria-label={tp("summaryLabel")} className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="flex flex-col gap-1.5 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
          <h2 className="m-0 text-sm font-medium text-ink-2">{tp("should")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(should)}</p>
          <p className="m-0 text-[13px] text-ink-3">{tp("shouldSub", { main: formatAmount(p.committed), calls: formatAmount(p.callShare) })}</p>
        </article>
        <article className="flex flex-col gap-1.5 rounded-2xl border border-line-2 bg-white px-5 py-4.5">
          <h2 className="m-0 text-sm font-medium text-ink-2">{t("paidTitle")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-semibold">৳ {formatAmount(p.paid)}</p>
          <div role="img" aria-label={t("paidAria", { percent: formatPercent(percent) })} className="flex items-center gap-2">
            <span className="h-1.5 grow overflow-hidden rounded-full bg-line-3">
              <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, percent).toFixed(1)}%` }} />
            </span>
            <span className="text-[13px] text-ink-3">{formatPercent(percent)}</span>
          </div>
        </article>
        <article
          className={cn(
            "flex flex-col gap-1.5 rounded-2xl border px-5 py-4.5",
            due > 0 ? "border-gold-line bg-gold-wash" : "border-success-line bg-brand-wash",
          )}
        >
          <h2 className={cn("m-0 text-sm font-semibold", due > 0 ? "text-gold-deep" : "text-success")}>{due > 0 ? t("dueHead") : t("noDueHead")}</h2>
          <p className="m-0 text-[26px] leading-[1.2] font-bold">৳ {formatAmount(Math.max(0, due))}</p>
          <p className="m-0 text-[13px] text-ink-2">
            {lastPaid ? t("lastPaid", { date: dayFirst(lastPaid.date.slice(0, 10)), amount: formatAmount(lastPaid.amount) }) : t("neverPaid")}
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_344px]">
        <PartnerLedger projectId={projectId} detail={detail} />
        <PartnerSidePanels detail={detail} projectName={projectName} from={from} />
      </div>

      {depositing && <DepositDialog projectId={projectId} partner={p} calls={detail.calls} accounts={accounts} onClose={() => setDepositing(false)} />}
    </>
  );
}
