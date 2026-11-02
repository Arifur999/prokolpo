import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { dueOf, owedBy, percentText, toTenths } from "@/lib/partnerMath";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IPartner } from "@/types/partners.types";
import { PartnerAvatar, ShareSwatch } from "./PartnerAvatar";
import { partnerTag, TAG_LOOK } from "./partnerTag";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_96px_150px_136px_160px_180px] lg:items-center";
const MONEY = "text-right lg:pr-4";

type PartnerTableProps = { projectId: string; partners: IPartner[]; canWrite: boolean; onDeposit: (p: IPartner) => void };

// "পার্টনারদের হিসাব": every partner's share, what they should have put in, paid, and owe.
export function PartnerTable({ projectId, partners, canWrite, onDeposit }: PartnerTableProps) {
  const t = useTranslations("Partners");
  const should = partners.reduce((sum, p) => sum + owedBy(p), 0);
  const paid = partners.reduce((sum, p) => sum + p.paid, 0);
  const due = partners.reduce((sum, p) => sum + Math.max(0, dueOf(p)), 0);
  const shareTenths = partners.reduce((sum, p) => sum + toTenths(p.share), 0);

  return (
    <section aria-labelledby="pt-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-2 px-5 py-3.5">
        <h2 id="pt-title" className="m-0 text-[17px] font-semibold">
          {t("tableTitle")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("tableNote")}</span>
      </div>
      <div role="table" aria-labelledby="pt-title">
        <div role="row" className={cn("hidden h-10.5 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}>
          <span role="columnheader">{t("colPartner")}</span>
          <span role="columnheader">{t("colShare")}</span>
          <span role="columnheader" className={MONEY}>
            {t("colShould")}
          </span>
          <span role="columnheader" className={MONEY}>
            {t("colPaid")}
          </span>
          <span role="columnheader" className={MONEY}>
            {t("colDue")}
          </span>
          <span role="columnheader">
            <span className="sr-only">{t("colActions")}</span>
          </span>
        </div>
        {partners.map((p) => (
          <PartnerRow key={p.id} projectId={projectId} partner={p} canWrite={canWrite} onDeposit={() => onDeposit(p)} />
        ))}
        {partners.length === 0 && <p className="m-0 px-5 py-8 text-center text-[15px] text-ink-3">{t("empty")}</p>}
        <div role="row" className={cn("flex flex-wrap gap-x-4 bg-surface-2 px-5 py-3 text-sm lg:gap-x-0", GRID)}>
          <span role="cell" className="font-semibold">
            {t("total", { count: partners.length })}
          </span>
          <span role="cell" className={cn("font-bold", shareTenths === 1000 ? "text-success" : "text-danger")}>
            {percentText(shareTenths / 10)}
          </span>
          <span role="cell" className={cn("font-semibold", MONEY)}>
            {formatAmount(should)}
          </span>
          <span role="cell" className={cn("font-semibold", MONEY)}>
            {formatAmount(paid)}
          </span>
          <span role="cell" className={cn("text-base font-bold", MONEY)}>
            ৳ {formatAmount(due)}
          </span>
          <span role="cell" />
        </div>
      </div>
    </section>
  );
}

function PartnerRow({ projectId, partner: p, canWrite, onDeposit }: { projectId: string; partner: IPartner; canWrite: boolean; onDeposit: () => void }) {
  const t = useTranslations("Partners");
  const owed = owedBy(p);
  const left = dueOf(p);
  const percent = owed ? Math.round((p.paid / owed) * 100) : 0;
  const tag = partnerTag(p);
  const href = projectHref(projectId, `partners/${p.id}`);

  return (
    <div role="row" className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-3 px-5 py-3 lg:min-h-17.5 lg:gap-x-0 lg:py-0", GRID)}>
      <span role="cell" className="flex min-w-0 grow items-center gap-3">
        <PartnerAvatar name={p.name} color={p.color} />
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5">
            <Link href={href} className="text-[15px] font-semibold whitespace-nowrap text-ink no-underline hover:text-brand">
              {p.name}
            </Link>
            <span className={cn("rounded-full px-1.75 text-xs font-semibold whitespace-nowrap", TAG_LOOK[tag])}>{t(`tag.${tag}`)}</span>
          </span>
          <span className="text-[13px] text-ink-3">{displayPhone(p.phone)}</span>
        </span>
      </span>
      <span role="cell" className="flex items-center gap-1.5 text-base font-bold">
        <ShareSwatch color={p.color} />
        {percentText(p.share)}
      </span>
      <span role="cell" className={cn("flex flex-col items-end", MONEY)}>
        <span className="text-[15px]">{formatAmount(owed)}</span>
        <span className="text-xs whitespace-nowrap text-ink-3">{t("rowShouldSub", { main: formatAmount(p.committed), calls: formatAmount(p.callShare) })}</span>
      </span>
      <span role="cell" className={cn("text-[15px] text-ink-2", MONEY)}>
        {formatAmount(p.paid)}
      </span>
      <span role="cell" className={cn("flex flex-col items-end", MONEY)}>
        {left > 0 ? (
          <>
            <span className="text-base font-bold text-gold-ink">{formatAmount(left)}</span>
            <span className="flex items-center gap-1.5 text-xs text-ink-3">
              <span className="h-1 w-11 overflow-hidden rounded-full bg-line-3">
                <span className="block h-full bg-brand-mid" style={{ width: `${Math.min(100, percent)}%` }} />
              </span>
              {t("paidPercent", { percent: `${percent}%` })}
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2.25 py-px text-[13px] font-semibold text-success">
            <Icon name="check" size={14} strokeWidth={2.4} />
            {t("allPaid")}
          </span>
        )}
      </span>
      <span role="cell" className="ml-auto flex items-center justify-end gap-1.5">
        {canWrite && (
          <button
            type="button"
            aria-label={t("depositLabel", { name: p.name })}
            onClick={onDeposit}
            className="h-9 cursor-pointer rounded-[9px] border border-brand bg-white px-3 text-sm font-semibold whitespace-nowrap text-brand"
          >
            {t("takeDeposit")}
          </button>
        )}
        <Link
          href={href}
          aria-label={t("detailLabel", { name: p.name })}
          className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
        >
          <Icon name="chevronRight" size={18} strokeWidth={2} />
        </Link>
      </span>
    </div>
  );
}
