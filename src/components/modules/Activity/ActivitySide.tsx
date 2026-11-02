import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { shortDay } from "@/lib/activityGroups";
import { dayFirst } from "@/lib/expenseText";
import type { IActivityWeek } from "@/types/members.types";

// Beside the timeline (board Activity): entries per member from Sunday to today, and the
// promise that nothing is ever lost.
export function ActivitySide({ week, today }: { week: IActivityWeek; today: string }) {
  const t = useTranslations("Activity");
  const total = week.counts.reduce((sum, c) => sum + c.count, 0);
  const max = Math.max(1, ...week.counts.map((c) => c.count));

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="wk-title" className="flex flex-col gap-3.5 rounded-2xl border border-line-2 bg-white p-5">
        <div className="flex flex-col gap-0.5">
          <h2 id="wk-title" className="m-0 text-base font-semibold">
            {t("weekTitle")}
          </h2>
          <p className="m-0 text-[13px] text-ink-3">{t("weekSub", { from: shortDay(week.from), to: dayFirst(today), count: total })}</p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {week.counts.map((c) => (
            <li key={c.userId} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <strong className="font-bold">{t("count", { count: c.count })}</strong>
              </div>
              <div role="img" aria-label={t("weekAria", { name: c.name, count: c.count })} className="h-2">
                <div className="h-full min-w-0.5 rounded-r bg-brand-mid" style={{ width: `${((c.count / max) * 100).toFixed(1)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2.5 rounded-2xl border border-gold-line bg-gold-wash px-5 py-4.5">
        <h2 className="m-0 flex items-center gap-2 text-[15px] font-semibold text-gold-deep">
          <Icon name="shield" size={18} strokeWidth={2} />
          {t("safeTitle")}
        </h2>
        <p className="m-0 text-sm leading-[1.6] text-ink-2">{t("safe1")}</p>
        <p className="m-0 text-sm leading-[1.6] text-ink-2">{t("safe2")}</p>
      </section>
    </div>
  );
}
