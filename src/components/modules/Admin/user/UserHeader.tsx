import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { whenText } from "@/lib/whenText";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";

// The account's name, status and language, its contact line, and its open support request
// (board AdminUserDetail).
export function UserHeader({ u, now }: { u: IAdminUserDetail; now: string }) {
  const t = useTranslations("AdminUser");
  const td = useTranslations("Admin.dashboard");
  const off = u.status === "suspended";
  const name = `${u.firstName} ${u.lastName}`;
  const initials = [u.firstName, u.lastName].map((p) => Array.from(p.trim())[0] ?? "").join("");

  return (
    <>
      <nav aria-label={t("crumb")} className="flex items-center gap-1.5 text-sm text-ink-2">
        <Link href="/admin/users" className="text-ink-2 no-underline">
          {t("users")}
        </Link>
        <Icon name="chevronRight" size={14} strokeWidth={2} />
        <span className="font-semibold text-ink">{name}</span>
      </nav>
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-16 shrink-0 items-center justify-center rounded-full text-[22px] font-bold",
              off ? "bg-surface-4 text-ink-5" : "bg-brand-tint text-brand",
            )}
          >
            {initials}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{name}</h1>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[13px] font-semibold", off ? "bg-danger-tint text-danger" : "bg-brand-tint text-success")}>
                {off ? t("suspended") : t("active")}
              </span>
              <span className="rounded-full bg-surface-4 px-2.5 py-0.5 text-[13px] font-semibold text-ink-2">{t(`langs.${u.locale}`)}</span>
            </div>
            <p className="m-0 text-[15px] text-ink-2">
              {t("headLine", {
                phone: displayPhone(u.phone),
                email: u.email ?? t("noEmail"),
                joined: whenText(u.createdAt, now, td),
                last: whenText(u.lastActive ?? u.createdAt, now, td),
              })}
            </p>
          </div>
        </div>
        {u.ticket && (
          <Link
            href="/admin/support"
            className="flex shrink-0 items-center gap-2.5 rounded-xl border border-line-2 bg-white px-3.5 py-2.5 text-ink no-underline hover:text-ink"
          >
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-gold-tint text-gold-ink">
              <Icon name="lifeBuoy" size={18} strokeWidth={2} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold">{t("ticket", { number: u.ticket.number })}</span>
              <span className="text-xs text-ink-3">
                {t("ticketSub", { topic: t(`topics.${u.ticket.topic as "login"}`), when: whenText(u.ticket.at, now, td) })}
              </span>
            </span>
          </Link>
        )}
      </header>
    </>
  );
}
