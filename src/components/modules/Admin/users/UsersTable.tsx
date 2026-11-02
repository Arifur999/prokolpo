import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { dhakaToday, formatDate, formatTime } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IAdminUserRow } from "@/types/admin.types";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_210px_112px_128px_168px_84px_28px] lg:items-center lg:gap-x-3";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => Array.from(p)[0] ?? "")
    .slice(0, 2)
    .join("");

// The accounts (board AdminUsers): who, how to reach them, when they joined and were last
// seen, their projects and whether they are suspended.
export function UsersTable({ rows, now }: { rows: IAdminUserRow[]; now: string }) {
  const t = useTranslations("AdminUsers");
  const roles = useTranslations("AdminSecurity.roles");
  const today = dhakaToday(new Date(now));
  const when = (iso: string) => {
    const at = new Date(iso);
    return dhakaToday(at) === today ? `${formatTime(at)}` : formatDate(at);
  };

  return (
    <div role="table" aria-label={t("title")}>
      <div role="row" className={cn("hidden h-10.5 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2", GRID)}>
        {(["user", "contact", "joined", "last", "projects", "status"] as const).map((k) => (
          <span key={k} role="columnheader">
            {t(`cols.${k}`)}
          </span>
        ))}
        <span role="columnheader">
          <span className="sr-only">{t("cols.open")}</span>
        </span>
      </div>
      {rows.map((u) => {
        const off = u.status === "suspended";
        const href = `/admin/users/${u.id}`;
        const note = off ? t("suspendedNote", { reason: u.suspendedReason ?? "" }) : u.openTicket ? t("ticketNote", { number: u.openTicket }) : null;
        const projects = [u.owned ? t("owned", { count: u.owned }) : null, u.member ? t("member", { count: u.member }) : null].filter(Boolean).join(" · ");
        const recent = u.lastActive && dhakaToday(new Date(u.lastActive)) === today;
        return (
          <div
            key={u.id}
            role="row"
            className={cn("flex min-h-15.5 flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-3 px-5 py-2 text-sm hover:bg-surface-3", GRID)}
          >
            <span role="cell" className="flex w-full min-w-0 items-center gap-3 lg:w-auto">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-9.5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                  u.staffRole ? "bg-ink text-gold-light" : off ? "bg-surface-4 text-ink-5" : "bg-brand-tint text-brand",
                )}
              >
                {initialsOf(u.name)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Link href={href} className="truncate text-[15px] font-semibold text-ink no-underline hover:text-brand">
                    {u.name}
                  </Link>
                  {u.staffRole && <span className="shrink-0 rounded-md bg-ink px-1.75 text-[11px] font-bold text-gold-light">{roles(u.staffRole)}</span>}
                  {u.locale === "en" && (
                    <span lang="en" className="shrink-0 rounded-md bg-gold-tint px-1.5 text-[11px] font-bold text-gold-ink">
                      English
                    </span>
                  )}
                </span>
                <span className={cn("truncate text-xs", note ? (off ? "text-danger" : "text-gold-ink") : "text-ink-3")}>
                  {note ?? u.company ?? t("noCompany")}
                </span>
              </span>
            </span>
            <span role="cell" className="flex min-w-0 flex-col">
              <span>{displayPhone(u.phone)}</span>
              <span className={cn("truncate text-xs", u.email ? "text-ink-3" : "text-gold-ink")}>{u.email ?? t("noEmail")}</span>
            </span>
            <span role="cell" className="text-ink-2">
              {formatDate(new Date(u.createdAt))}
            </span>
            <span role="cell" className="flex items-center gap-1.5 text-ink-2">
              <span aria-hidden="true" className={cn("size-1.75 shrink-0 rounded-full", recent ? "bg-brand-mid" : "bg-line-strong")} />
              {u.lastActive ? when(u.lastActive) : t("never")}
            </span>
            <span role="cell" className="text-ink-2">
              {projects || t("noProjects")}
            </span>
            <span role="cell">
              <span className={cn("rounded-full px-2.25 py-0.5 text-[13px] font-semibold", off ? "bg-danger-tint text-danger" : "bg-brand-tint text-success")}>
                {off ? t("suspended") : t("active")}
              </span>
            </span>
            <span role="cell" className="ml-auto lg:ml-0">
              <Link href={href} aria-label={t("openLabel", { name: u.name })} className="flex size-7 items-center justify-center rounded-lg text-ink-3">
                <Icon name="chevronRight" size={18} strokeWidth={2} />
              </Link>
            </span>
          </div>
        );
      })}
    </div>
  );
}
