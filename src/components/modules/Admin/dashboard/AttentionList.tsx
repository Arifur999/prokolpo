import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { formatDate } from "@/lib/dhakaTime";
import { cn } from "@/lib/utils";
import type { IAdminOverview } from "@/types/admin.types";

const DAY_MS = 86_400_000;
const TONES = {
  gold: { box: "bg-gold-tint text-gold-ink", sub: "text-gold-ink" },
  red: { box: "bg-danger-tint text-danger", sub: "text-danger" },
  grey: { box: "bg-surface-4 text-ink-2", sub: "text-ink-3" },
  green: { box: "bg-brand-tint text-success", sub: "text-success" },
};

// "নজর দিন" (board AdminDashboard): what wants a look, each a link to its page; a quiet line
// when there is nothing.
export function AttentionList({ attention: a, now }: Pick<IAdminOverview, "attention"> & { now: string }) {
  const t = useTranslations("Admin.dashboard");
  const days = (iso: string) => Math.max(0, Math.floor((Date.parse(now) - Date.parse(iso)) / DAY_MS));
  const items: { href: string; icon: IconName; tone: keyof typeof TONES; title: string; sub: string }[] = [
    a.openSupport
      ? {
          href: "/admin/support",
          icon: "lifeBuoy",
          tone: "gold",
          title: t("support", { count: a.openSupport }),
          sub: t("supportSub", { days: days(a.oldestSupport ?? "") }),
        }
      : { href: "/admin/support", icon: "lifeBuoy", tone: "grey", title: t("supportNone"), sub: "" },
    a.purgeSoon
      ? {
          href: "/admin/projects",
          icon: "trash",
          tone: "red",
          title: t("purge", { count: a.purgeSoon }),
          sub: t("purgeSub", { date: formatDate(new Date(a.firstPurge ?? "")) }),
        }
      : { href: "/admin/projects", icon: "trash", tone: "grey", title: t("purgeNone"), sub: "" },
    a.suspended
      ? {
          href: "/admin/users",
          icon: "ban",
          tone: "grey",
          title: t("suspended", { count: a.suspended }),
          sub: t("suspendedSub", { date: formatDate(new Date(a.lastSuspended ?? "")) }),
        }
      : { href: "/admin/users", icon: "ban", tone: "grey", title: t("suspendedNone"), sub: "" },
    a.staffWithout2fa
      ? { href: "/admin/settings", icon: "shieldCheck", tone: "gold", title: t("staffMissing", { count: a.staffWithout2fa }), sub: t("staffMissingSub") }
      : { href: "/admin/settings", icon: "shieldCheck", tone: "green", title: t("staffOk"), sub: t("staffOkSub", { count: a.staff }) },
  ];

  return (
    <section aria-labelledby="ad-attn-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="border-b border-line-2 px-5 py-4">
        <h2 id="ad-attn-title" className="m-0 text-[17px] font-semibold">
          {t("attention")}
        </h2>
      </div>
      {items.map((i) => (
        <Link
          key={i.href + i.icon}
          href={i.href}
          className="flex items-center gap-3 border-b border-line-3 px-5 py-3.5 text-ink no-underline last:border-b-0 hover:bg-surface-3 hover:text-ink"
        >
          <span className={cn("flex size-9.5 shrink-0 items-center justify-center rounded-[10px]", TONES[i.tone].box)}>
            <Icon name={i.icon} size={18} strokeWidth={2} />
          </span>
          <span className="flex grow flex-col">
            <span className="text-[15px] font-semibold">{i.title}</span>
            {i.sub && <span className={cn("text-[13px]", TONES[i.tone].sub)}>{i.sub}</span>}
          </span>
          <Icon name="chevronRight" size={18} strokeWidth={2} className="text-ink-5" />
        </Link>
      ))}
    </section>
  );
}
