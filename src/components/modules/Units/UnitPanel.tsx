import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { dayFirst } from "@/lib/expenseText";
import { nameInitials } from "@/lib/memberLook";
import { formatAmount, formatPercent } from "@/lib/money";
import { displayPhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import { floorShort, STATUS_LOOK, unitStatus } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { IUnit } from "@/types/sales.types";

type UnitPanelProps = { projectId: string; unit: IUnit | undefined; canWrite: boolean; onEdit: () => void };

const day = (iso: string) => dayFirst(iso.slice(0, 10));

// The aside beside the floor board (board Units): the picked unit's price, buyer and
// installments, with what to do next.
export function UnitPanel({ projectId, unit: u, canWrite, onEdit }: UnitPanelProps) {
  const t = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";

  if (!u) {
    return (
      <aside aria-label={t("detailsLabel")} className="flex flex-col items-center gap-2.5 rounded-2xl border border-line-2 bg-white px-2 py-9 text-center">
        <span className="flex size-13 items-center justify-center rounded-2xl bg-surface-4 text-ink-2">
          <Icon name="building" size={24} strokeWidth={2} />
        </span>
        <strong className="text-base font-semibold">{t("pickTitle")}</strong>
        <span className="text-sm leading-[1.6] text-ink-3">{t("pickBody")}</span>
      </aside>
    );
  }

  const status = unitStatus(u);
  const look = STATUS_LOOK[status];
  const sale = u.sale;
  const percent = sale ? (sale.standing.received / sale.price) * 100 : 0;

  return (
    <aside aria-label={t("detailsLabel")} className="flex flex-col gap-4 rounded-2xl border border-line-2 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="m-0 flex flex-wrap items-center gap-2 text-[22px] leading-[1.3] font-semibold">
            {u.name}
            <span className={cn("rounded-full px-2.5 py-px text-[13px] font-bold", look.pill)}>{t(`status.${status}`)}</span>
          </h2>
          <span className="text-[13px] text-ink-3">
            {[t("floor", { floor: floorShort(locale, u.floor) }), t(`type.${u.type}`), u.size ? `${u.size} sqft` : null].filter(Boolean).join(" · ")}
          </span>
        </div>
        {canWrite && (
          <button
            type="button"
            aria-label={t("editLabel", { name: u.name })}
            onClick={onEdit}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[9px] border border-line-2 bg-white text-ink-2"
          >
            <Icon name="pencil" size={16} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-surface-2 px-3.5 py-3">
        <span className="text-sm text-ink-2">{t("listPrice")}</span>
        <strong className="text-lg font-bold">৳ {formatAmount(u.price)}</strong>
      </div>

      {!sale ? (
        <>
          <p className="m-0 text-sm leading-[1.6] text-ink-2">{t("notSold")}</p>
          {canWrite && (
            <Link
              href={projectHref(projectId, `sales/new?unit=${u.id}`)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white no-underline hover:text-white"
            >
              <Icon name="key" size={18} strokeWidth={2} />
              {t("sell")}
            </Link>
          )}
          <p className="m-0 text-[13px] leading-[1.6] text-ink-3">{t("sellNote")}</p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-10.5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand">
              {nameInitials(sale.customer)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[13px] text-ink-3">{t("buyer")}</span>
              <Link href={projectHref(projectId, `customers/${sale.customerId}`)} className="text-base font-semibold text-ink no-underline">
                {sale.customer}
              </Link>
              <span className="text-[13px] text-ink-2">{displayPhone(sale.phone)}</span>
            </span>
          </div>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-ink-2">{t("saleDate")}</dt>
            <dd className="m-0 text-right font-semibold">{day(sale.date)}</dd>
            <dt className="text-ink-2">{t("salePrice")}</dt>
            <dd className="m-0 flex flex-col items-end font-semibold">
              ৳ {formatAmount(sale.price)}
              {u.price > sale.price && <span className="text-xs font-medium text-ink-3">{t("discount", { amount: formatAmount(u.price - sale.price) })}</span>}
            </dd>
          </dl>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-2">{t("received")}</span>
              <strong className="font-bold text-success">৳ {formatAmount(sale.standing.received)}</strong>
            </div>
            <div role="img" aria-label={t("receivedAria", { percent: formatPercent(percent) })} className="h-2 overflow-hidden rounded-full bg-line-3">
              <span className="block h-full rounded-full bg-brand-mid" style={{ width: `${Math.min(100, percent).toFixed(1)}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-3">{formatPercent(percent)}</span>
              <span className={cn("font-bold", sale.standing.due > 0 ? "text-gold-ink" : "text-success")}>
                {sale.standing.due > 0 ? t("dueLeft", { amount: formatAmount(sale.standing.due) }) : t("nothingDue")}
              </span>
            </div>
          </div>

          {status === "BOOKED" && sale.installments > 0 && (
            <>
              <div className="flex flex-col gap-2 border-t border-line-3 pt-3.5">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-semibold">{t("installments")}</span>
                  <span className="text-ink-2">
                    {t("installmentsText", { count: sale.installments, paid: sale.standing.paidCount, amount: formatAmount(sale.installment) })}
                  </span>
                </div>
                <div role="img" aria-label={t("installmentsAria", { count: sale.installments, paid: sale.standing.paidCount })} className="flex gap-0.5">
                  {Array.from({ length: sale.installments }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2 grow rounded-[2px]",
                        i < sale.standing.paidCount ? "bg-brand-mid" : sale.standing.late && i + 1 === sale.standing.late.no ? "bg-danger-strong" : "bg-line-2",
                      )}
                    />
                  ))}
                </div>
                <span className="text-[13px] text-ink-3">{t("downText", { amount: formatAmount(sale.down) })}</span>
                {sale.standing.late ? (
                  <div className="flex items-start gap-2.5 rounded-[10px] bg-danger-tint px-3 py-2.5 text-sm leading-normal text-danger">
                    <Icon name="alertTriangle" size={18} strokeWidth={2} className="mt-px shrink-0" />
                    <span className="flex flex-col">
                      <strong className="font-bold">{t("lateTitle", { no: sale.standing.late.no, amount: formatAmount(sale.standing.late.amount) })}</strong>
                      <span>{t("lateText", { date: day(sale.standing.late.date), days: sale.standing.late.days })}</span>
                    </span>
                  </div>
                ) : (
                  sale.standing.next && (
                    <div className="flex items-center gap-2.5 rounded-[10px] bg-brand-wash px-3 py-2.5 text-sm text-brand">
                      <Icon name="calendar" size={18} strokeWidth={2} />
                      <span>
                        {t("nextText", { no: sale.standing.next.no, date: day(sale.standing.next.date), amount: formatAmount(sale.standing.next.amount) })}
                      </span>
                    </div>
                  )
                )}
              </div>
              {canWrite && (
                <Link
                  href={projectHref(projectId, `sales/${sale.id}?collect=1`)}
                  className="flex h-11.5 items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-semibold text-white no-underline hover:text-white"
                >
                  {t("collect")}
                </Link>
              )}
            </>
          )}
          {status === "SOLD" && (
            <div className="flex items-start gap-2.5 rounded-[10px] bg-brand-tint px-3 py-2.5 text-sm leading-normal text-success">
              <Icon name="checkCircle" size={18} strokeWidth={2} className="mt-px shrink-0" />
              <span>
                {sale.installments
                  ? t("fullIn", { amount: formatAmount(sale.price) })
                  : t("fullOnce", { amount: formatAmount(sale.price), date: day(sale.date) })}
              </span>
            </div>
          )}
          <Link
            href={projectHref(projectId, `sales/${sale.id}`)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-[15px] font-semibold text-ink no-underline"
          >
            {t("saleLink")}
            <Icon name="chevronRight" size={16} strokeWidth={2} />
          </Link>
        </>
      )}
    </aside>
  );
}
