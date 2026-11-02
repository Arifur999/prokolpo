import Link from "next/link";
import { useTranslations } from "next-intl";
import { dhakaToday, formatDate, formatTime } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IAdminOverview } from "@/types/admin.types";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_118px_104px_150px_70px] lg:items-center lg:gap-x-3";

// "সাম্প্রতিক রেজিস্ট্রেশন" (board AdminDashboard): the latest accounts and what they opened.
export function RecentSignups({ recent, now }: Pick<IAdminOverview, "recent"> & { now: string }) {
  const t = useTranslations("Admin.dashboard");
  const today = dhakaToday(new Date(now));
  const yesterday = dhakaToday(new Date(Date.parse(now) - 86_400_000));
  const when = (iso: string) => {
    const at = new Date(iso);
    const day = dhakaToday(at);
    if (day === today) return t("today", { time: formatTime(at) });
    if (day === yesterday) return t("yesterday", { time: formatTime(at) });
    return formatDate(at);
  };

  return (
    <section aria-labelledby="ad-new-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex items-center justify-between border-b border-line-2 px-5.5 py-4">
        <h2 id="ad-new-title" className="m-0 text-[17px] font-semibold">
          {t("recent")}
        </h2>
        <Link href="/admin/users" className="text-sm font-semibold no-underline">
          {t("allUsers")}
        </Link>
      </div>
      <div role="table" aria-labelledby="ad-new-title">
        <div role="row" className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-5.5 text-[13px] font-semibold text-ink-2", GRID)}>
          {(["name", "phone", "joined", "projects", "email"] as const).map((k) => (
            <span key={k} role="columnheader">
              {t(`cols.${k}`)}
            </span>
          ))}
        </div>
        {recent.map((u) => (
          <div
            key={u.id}
            role="row"
            className={cn("flex min-h-14.5 flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 px-5.5 py-2 text-sm hover:bg-surface-3", GRID)}
          >
            <span role="cell" className="flex w-full min-w-0 flex-col lg:w-auto">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="truncate">{u.name}</span>
                {u.locale === "en" && (
                  <span lang="en" className="shrink-0 rounded-md bg-gold-tint px-1.5 text-[11px] font-bold text-gold-ink">
                    English
                  </span>
                )}
              </span>
              <span className="text-xs text-ink-3">{u.company ?? t("noCompany")}</span>
            </span>
            <span role="cell">{displayPhone(u.phone)}</span>
            <span role="cell" className="text-ink-2">
              {when(u.createdAt)}
            </span>
            <span role="cell" className="text-ink-2">
              {u.kinds.length
                ? t("projectCount", { count: u.kinds.length, kinds: [...new Set(u.kinds)].map((k) => t(`kindNames.${k}`)).join(", ") })
                : t("notYet")}
            </span>
            <span role="cell" className={cn("text-[13px] font-semibold", u.hasEmail ? "text-success" : "text-gold-ink")}>
              {u.hasEmail ? t("hasEmail") : t("noEmail")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
