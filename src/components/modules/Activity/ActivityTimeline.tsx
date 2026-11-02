"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { olderActivityAction } from "@/app/(dashboardLayout)/projects/[projectId]/activity/_action";
import { restoreExpenseAction } from "@/app/(dashboardLayout)/projects/[projectId]/expenses/_action";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Segmented } from "@/components/shared/Segmented";
import { groupByDay, shiftDay } from "@/lib/activityGroups";
import { dhakaToday, formatWeekdayDate } from "@/lib/dhakaTime";
import { ROLE_AVATAR } from "@/lib/memberLook";
import { formatAmount } from "@/lib/money";
import type { IActivityItem, IMember } from "@/types/members.types";
import { ActivityEntry } from "./ActivityEntry";

// The API's page size: a full page means there may be older entries.
const ACTIVITY_PAGE = 50;

type ActivityTimelineProps = {
  projectId: string;
  items: IActivityItem[];
  filters: Record<string, string>;
  people: Pick<IMember, "userId" | "name" | "role">[];
  canWrite: boolean;
};

const KINDS = ["ALL", "CREATE", "UPDATE", "DELETE"] as const;

// The timeline (board Activity): whose work and which kind of change, entries grouped by
// day, and "আরও আগের" for older pages. A deleted bill can be restored right here.
export function ActivityTimeline({ projectId, items: firstPage, filters, people, canWrite }: ActivityTimelineProps) {
  const t = useTranslations("Activity");
  const locale = useLocale() as "bn" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [items, setItems] = useState(firstPage);
  const [hasMore, setHasMore] = useState(firstPage.length === ACTIVITY_PAGE);
  const [restored, setRestored] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(search.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const loadOlder = () => {
    const oldest = items.at(-1);
    if (!oldest) return;
    startTransition(async () => {
      const result = await olderActivityAction(projectId, filters, oldest.createdAt);
      if (!result.success) return void toast.error(result.message);
      setItems((current) => [...current, ...result.data]);
      setHasMore(result.data.length === ACTIVITY_PAGE);
    });
  };

  const restore = (item: IActivityItem) =>
    startTransition(async () => {
      const result = await restoreExpenseAction(projectId, item.entityId);
      if (!result.success) return void toast.error(result.message);
      setRestored((current) => new Set(current).add(item.id));
      toast.success(t("restoredToast", { title: item.title ?? item.summary, amount: formatAmount(item.amount ?? 0) }));
    });

  const avatarOf = (actorId: string) => ROLE_AVATAR[people.find((p) => p.userId === actorId)?.role ?? "VIEWER"];
  const today = dhakaToday();
  const dayLabel = (day: string) => {
    const weekday = formatWeekdayDate(new Date(`${day}T06:00:00Z`), locale);
    if (day === today) return t("todayDay", { day: weekday });
    if (day === shiftDay(today, -1)) return t("yesterdayDay", { day: weekday });
    return weekday;
  };
  const groups = groupByDay(items);

  return (
    <section aria-label={t("timeline")} className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line-2 px-5 py-3.5">
        <Segmented
          label={t("whoLabel")}
          value={filters.actor ?? ""}
          onChange={(value) => setFilter("actor", value)}
          options={[{ value: "", label: t("everyone") }, ...people.map((p) => ({ value: p.userId, label: p.name }))]}
          className="max-w-full"
        />
        <div className="ml-auto">
          <FilterSelect
            label={t("kindLabel")}
            value={filters.action ?? "ALL"}
            onChange={(value) => setFilter("action", value === "ALL" ? "" : value)}
            options={KINDS.map((kind) => ({ value: kind, label: t(`kind.${kind}`) }))}
          />
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.day} className="flex flex-col">
          <h2 className="m-0 border-b border-line-3 bg-surface-2 px-5 py-2.5 text-sm font-semibold text-ink-2">
            {dayLabel(group.day)} <span className="font-medium text-ink-3">· {t("count", { count: group.items.length })}</span>
          </h2>
          <ol className="m-0 list-none p-0">
            {group.items.map((item) => (
              <ActivityEntry
                key={item.id}
                item={item}
                avatar={avatarOf(item.actorId)}
                canRestore={canWrite && item.deleted}
                restored={restored.has(item.id)}
                onRestore={() => restore(item)}
              />
            ))}
          </ol>
        </div>
      ))}

      {items.length === 0 && <p className="m-0 px-5 py-12 text-center text-[15px] text-ink-3">{t("empty")}</p>}
      {hasMore && (
        <div className="flex justify-center bg-surface-2 p-3.5">
          <button
            type="button"
            disabled={isPending}
            onClick={loadOlder}
            className="h-10 cursor-pointer rounded-[10px] border border-line bg-white px-4.5 text-sm font-semibold text-ink"
          >
            {isPending ? t("loading") : t("more")}
          </button>
        </div>
      )}
    </section>
  );
}
