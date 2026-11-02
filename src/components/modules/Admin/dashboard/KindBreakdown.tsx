import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/money";
import type { IAdminOverview } from "@/types/admin.types";
import type { ProjectKind } from "@/types/project.types";

const KINDS: ProjectKind[] = ["BUILDING", "FARM", "BUSINESS", "LAND", "RENOVATION", "OTHER"];
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

// "ধরন অনুযায়ী প্রজেক্ট" (board AdminDashboard): projects by kind, then ownership and the
// users' language as two split bars.
export function KindBreakdown({ projects, users }: Pick<IAdminOverview, "projects" | "users">) {
  const t = useTranslations("Admin.dashboard");
  const rows = KINDS.map((k) => ({ kind: k, count: projects.byKind[k] ?? 0 })).sort((a, b) => b.count - a.count);
  const max = Math.max(1, rows[0]?.count ?? 0);
  const personal = projects.total - projects.joint;
  const people = users.bangla + users.english;
  const splits = [
    {
      title: t("ownership"),
      dark: projects.joint,
      darkLabel: t("joint"),
      light: personal,
      lightLabel: t("personal"),
      lightBar: "bg-brand-line",
      whole: projects.total,
    },
    { title: t("languageMix"), dark: users.bangla, darkLabel: t("bangla"), light: users.english, lightLabel: t("english"), lightBar: "bg-gold", whole: people },
  ];

  return (
    <section aria-labelledby="ad-kind-title" className="flex flex-col gap-3.5 rounded-2xl border border-line-2 bg-white px-5.5 py-5">
      <div className="flex flex-col">
        <h2 id="ad-kind-title" className="m-0 text-[17px] font-semibold">
          {t("kinds")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("kindsSub", { total: formatAmount(projects.total) })}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.kind} className="grid grid-cols-[110px_minmax(0,1fr)_100px] items-center gap-3.5 sm:grid-cols-[128px_minmax(0,1fr)_112px]">
            <span className="text-sm font-medium">{t(`kindNames.${r.kind}`)}</span>
            <span aria-hidden="true" className="flex h-3 overflow-hidden rounded-full bg-surface-4">
              <span className="rounded-full bg-brand-mid" style={{ width: `${((r.count / max) * 100).toFixed(1)}%` }} />
            </span>
            <span className="text-right text-sm font-semibold">
              {formatAmount(r.count)} · {pct(r.count, projects.total)}%
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 border-t border-line-3 pt-3.5 sm:grid-cols-2">
        {splits.map((s) => (
          <div key={s.title} className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-ink-2">{s.title}</span>
            <span aria-hidden="true" className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-4">
              {s.whole > 0 && (
                <>
                  <span className="bg-brand" style={{ width: `${pct(s.dark, s.whole)}%` }} />
                  <span className={s.lightBar} style={{ width: `${100 - pct(s.dark, s.whole)}%` }} />
                </>
              )}
            </span>
            <span className="flex justify-between text-[13px] text-ink-2">
              <span>
                <strong className="text-ink">{s.darkLabel}</strong> {formatAmount(s.dark)} · {pct(s.dark, s.whole)}%
              </span>
              <span>
                <strong className="text-ink">{s.lightLabel}</strong> {formatAmount(s.light)} · {s.whole ? 100 - pct(s.dark, s.whole) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
