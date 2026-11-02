import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { formatAmount } from "@/lib/money";
import type { OverviewFigures, overviewFeatures } from "@/lib/overview";
import { cn } from "@/lib/utils";

type Figure = { key: string; icon: IconName; title: string; value: string; note: string; alert?: boolean };

type KeyFiguresProps = {
  figures: OverviewFigures;
  features: ReturnType<typeof overviewFeatures>;
  accountCount: number;
};

// "মূল হিসাব": cash, what is owed each way, and this month's movement (boards Main, Mobile).
export function KeyFigures({ figures: f, features, accountCount }: KeyFiguresProps) {
  const t = useTranslations("Overview.stats");
  const taka = (amount: number) => `৳ ${formatAmount(amount)}`;
  // "গত মাসের চেয়ে 19% কম", or a nudge when nothing is entered yet.
  const monthNote = (now: number, last: number) => {
    if (!now && !last) return t("monthSpentNote");
    if (!last) return "";
    const change = Math.round(((now - last) / last) * 100);
    if (change === 0) return t("monthSame");
    return t(change < 0 ? "monthLess" : "monthMore", { percent: Math.abs(change) });
  };

  const cards: Figure[] = [
    { key: "cash", icon: "wallet", title: t("cash"), value: taka(f.cash), note: t("cashNote", { count: accountCount }) },
    { key: "suppliers", icon: "store", title: t("suppliers"), value: taka(f.supplierDue), note: t("suppliersNote", { count: f.supplierCount }) },
    { key: "contractors", icon: "hardHat", title: t("contractors"), value: taka(f.contractorDue), note: t("contractorsNote", { count: f.contractorCount }) },
  ];
  if (features.partners) {
    cards.push({
      key: "partners",
      icon: "users",
      title: t("partners"),
      value: taka(f.partnerDue),
      note: t("partnersNote", { count: f.partnerCount, due: f.partnersOwing }),
    });
  }
  if (features.installments) {
    cards.push(
      { key: "customers", icon: "key", title: t("customers"), value: taka(f.customerDue), note: t("customersNote", { count: f.saleCount }) },
      {
        key: "monthInstallments",
        icon: "calendarTick",
        title: t("monthInstallments"),
        value: taka(f.monthInstallments),
        note: t("monthInstallmentsNote", { count: f.monthInstallmentCount }),
      },
      {
        key: "overdue",
        icon: "alertTriangle",
        title: t("overdue"),
        value: t("overdueValue", { count: f.overdueCount }),
        note: t("overdueNote", { amount: formatAmount(f.overdueAmount) }),
        alert: f.overdueCount > 0,
      },
    );
  }
  cards.push({ key: "monthSpent", icon: "receipt", title: t("monthSpent"), value: taka(f.monthSpent), note: monthNote(f.monthSpent, f.lastMonthSpent) });

  return (
    <section aria-label={t("label")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      {cards.map((card) => (
        <article
          key={card.key}
          className={cn(
            "flex flex-col gap-1 rounded-[14px] border bg-white p-3.5 lg:gap-2.5 lg:rounded-2xl lg:p-5",
            card.alert ? "border-danger-line" : "border-line-2",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="m-0 text-[13px] font-medium text-ink-2 lg:text-sm">{card.title}</h3>
            <span
              className={cn(
                "hidden size-9 shrink-0 items-center justify-center rounded-[10px] lg:flex",
                card.alert ? "bg-danger-tint text-danger-strong" : "bg-brand-tint text-brand",
              )}
            >
              <Icon name={card.icon} size={18} />
            </span>
          </div>
          <p className="m-0 text-[19px] leading-[1.3] font-semibold lg:text-[26px] lg:leading-[1.2]">{card.value}</p>
          {card.note && <p className={cn("m-0 text-[13px]", card.alert ? "font-semibold text-danger" : "text-ink-3")}>{card.note}</p>}
        </article>
      ))}
    </section>
  );
}
