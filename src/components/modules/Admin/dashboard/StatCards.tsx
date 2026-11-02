import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IAdminOverview } from "@/types/admin.types";

const pct = (part: number, whole: number) => `${whole ? Math.round((part / whole) * 100) : 0}%`;

// The four figures at the top of the admin dashboard (board AdminDashboard).
export function StatCards({ o }: { o: IAdminOverview }) {
  const t = useTranslations("Admin.dashboard");
  const cards: { title: string; value: number; note: string; icon: IconName; good?: boolean }[] = [
    { title: t("users"), value: o.users.total, note: t("usersSub", { count: o.users.thisWeek }), icon: "users", good: o.users.thisWeek > 0 },
    { title: t("active"), value: o.users.active30, note: t("activeSub", { percent: pct(o.users.active30, o.users.total) }), icon: "pulse" },
    {
      title: t("projects"),
      value: o.projects.total,
      note: t("projectsSub", { running: formatAmount(o.projects.running), joint: pct(o.projects.joint, o.projects.total) }),
      icon: "folders",
    },
    { title: t("entries"), value: o.entries30, note: t("entriesSub"), icon: "receipt" },
  ];
  return (
    <section aria-label={t("statsLabel")} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <article key={c.title} className="flex flex-col gap-2 rounded-2xl border border-line-2 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 text-sm font-medium text-ink-2">{c.title}</h2>
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-brand-tint text-brand">
              <Icon name={c.icon} size={18} strokeWidth={2} />
            </span>
          </div>
          <p className="m-0 text-[28px] leading-[1.2] font-semibold">{formatAmount(c.value)}</p>
          <p className={cn("m-0 text-[13px]", c.good ? "font-semibold text-success" : "text-ink-3")}>{c.note}</p>
        </article>
      ))}
    </section>
  );
}
