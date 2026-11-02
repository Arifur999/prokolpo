import Link from "next/link";
import { useTranslations } from "next-intl";
import { auditLine } from "@/lib/auditText";
import { dhakaToday, formatDate, formatTime } from "@/lib/dhakaTime";
import type { IAuditLine } from "@/types/admin.types";

// Each staff member keeps one colour in the log, picked from their id.
const AVATARS = ["bg-gold text-ink", "bg-info-tint text-info", "bg-brand-tint text-success", "bg-acc-4-tint text-acc-4"];
const avatar = (id: string | null) => AVATARS[id ? [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATARS.length : 0];

// "সাম্প্রতিক অ্যাডমিন কাজ" (board AdminDashboard): the latest admin log lines.
export function AuditFeed({ lines, now }: { lines: IAuditLine[]; now: string }) {
  const t = useTranslations("Admin.dashboard");
  const ta = useTranslations("Admin.audit");
  const translate = (key: string, values?: Record<string, string | number>) => ta(key as Parameters<typeof ta>[0], values);
  const today = dhakaToday(new Date(now));
  const when = (iso: string) => {
    const at = new Date(iso);
    return dhakaToday(at) === today ? t("today", { time: formatTime(at) }) : `${formatDate(at)} ${formatTime(at)}`;
  };

  return (
    <section aria-labelledby="ad-audit-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex items-center justify-between border-b border-line-2 px-5 py-4">
        <h2 id="ad-audit-title" className="m-0 text-[17px] font-semibold">
          {t("audit")}
        </h2>
        <Link href="/admin/audit" className="text-sm font-semibold no-underline">
          {t("fullLog")}
        </Link>
      </div>
      {lines.length ? (
        <ol className="m-0 list-none py-1">
          {lines.map((x) => {
            const line = auditLine(x, translate, (key) => ta.has(key as Parameters<typeof ta>[0]));
            const initials = x.actor
              .split(/\s+/)
              .map((p) => Array.from(p)[0] ?? "")
              .slice(0, 2)
              .join("");
            return (
              <li key={x.id} className="flex gap-3 px-5 py-3">
                <span aria-hidden="true" className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatar(x.actorId)}`}>
                  {initials}
                </span>
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <span className="text-sm leading-normal">
                    <strong className="font-semibold">{x.actor}</strong> {line.text}
                  </span>
                  {line.reason && (
                    <span className="self-start rounded-md bg-surface-2 px-2 py-px text-xs text-ink-2">{t("reason", { reason: line.reason })}</span>
                  )}
                  <span className="text-xs text-ink-5">{when(x.createdAt)}</span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="m-0 px-5 py-4 text-sm text-ink-3">{t("noAudit")}</p>
      )}
    </section>
  );
}
