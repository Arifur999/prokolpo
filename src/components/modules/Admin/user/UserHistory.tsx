import { useTranslations } from "next-intl";
import { auditLine } from "@/lib/auditText";
import { whenText } from "@/lib/dayLabel";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";
import { deviceLabel } from "./deviceLabel";

const MARKS = {
  support: { mark: "স", tone: "bg-gold-tint text-gold-ink" },
  fail: { mark: "!", tone: "bg-danger-tint text-danger" },
  login: { mark: "↪", tone: "bg-brand-tint text-success" },
  password: { mark: "P", tone: "bg-info-tint text-info" },
  join: { mark: "+", tone: "bg-surface-4 text-ink-2" },
  admin: { mark: "A", tone: "bg-ink text-gold-light" },
};

// "নিরাপত্তার ইতিহাস" (board AdminUserDetail): sign-ins, wrong passwords, password changes,
// support requests and staff actions, newest first.
export function UserHistory({ u, now }: { u: IAdminUserDetail; now: string }) {
  const t = useTranslations("AdminUser");
  const ta = useTranslations("Admin.audit");
  const td = useTranslations("Admin.dashboard");
  const translate = (key: string, values?: Record<string, string>) => t(key as Parameters<typeof t>[0], values);
  const audit = (key: string, values?: Record<string, string | number>) => ta(key as Parameters<typeof ta>[0], values);
  const name = `${u.firstName} ${u.lastName}`;

  const line = (h: IAdminUserDetail["history"][number]) => {
    switch (h.kind) {
      case "admin": {
        const a = auditLine({ action: h.text, summary: name, details: h.details }, audit);
        return { text: `${h.details.actor ?? ""} ${a.text}`.trim(), sub: a.reason ? t("reason", { reason: a.reason }) : "" };
      }
      case "support":
        return { text: t("events.support", { number: h.details.number ?? "" }), sub: h.details.message ? `"${h.details.message}"` : "" };
      case "login":
      case "fail":
        return { text: t(`events.${h.kind}`), sub: [deviceLabel(h.details.userAgent || null, translate).name, h.details.ip].filter(Boolean).join(" · ") };
      case "join":
        return {
          text: t("events.join"),
          sub: u.invitedBy ? [t("invitedBy", { name: u.invitedBy }), u.invitedTo].filter(Boolean).join(" — ") : t("selfJoined"),
        };
      default:
        return { text: t("events.password"), sub: "" };
    }
  };

  return (
    <section aria-labelledby="ud-hist" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line-3 px-5 py-3.5">
        <h2 id="ud-hist" className="m-0 text-[17px] font-semibold">
          {t("history")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("historySub")}</span>
      </div>
      <ol className="m-0 list-none py-1.5">
        {u.history.map((h, i) => {
          const m = MARKS[h.kind];
          const l = line(h);
          return (
            <li key={`${h.at}-${i}`} className="flex gap-3.5 px-5 py-2.5">
              <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold", m.tone)}>
                {m.mark}
              </span>
              <span className="flex min-w-0 grow flex-col">
                <span className="text-sm font-semibold">{l.text}</span>
                {l.sub && <span className="text-[13px] text-ink-2">{l.sub}</span>}
              </span>
              <span className="shrink-0 text-[13px] text-ink-3">{whenText(h.at, now, td, true)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
