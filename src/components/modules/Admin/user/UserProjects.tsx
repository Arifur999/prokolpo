import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { whenText } from "@/lib/whenText";
import type { IAdminUserDetail } from "@/types/admin.types";

// "প্রজেক্ট ও রোল" (board AdminUserDetail): where the account works and in which role; the
// books themselves stay closed to staff.
export function UserProjects({ u, now }: { u: IAdminUserDetail; now: string }) {
  const t = useTranslations("AdminUser");
  const kinds = useTranslations("Admin.dashboard.kindNames");
  const td = useTranslations("Admin.dashboard");
  return (
    <section aria-labelledby="ud-proj" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className="flex items-center justify-between border-b border-line-3 px-5 py-3.5">
        <h2 id="ud-proj" className="m-0 text-[17px] font-semibold">
          {t("projects")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("projectCount", { count: u.projects.length })}</span>
      </div>
      {u.projects.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center gap-3.5 border-b border-line-3 px-5 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-brand-tint text-brand">
            <Icon name="building" size={20} strokeWidth={2} />
          </span>
          <span className="flex min-w-0 grow flex-col">
            <span className="text-[15px] font-semibold">{p.name}</span>
            <span className="text-[13px] text-ink-3">
              {t("projectSub", {
                kind: kinds(p.kind),
                ownership: t(`ownership.${p.ownership}`),
                owner: p.ownerId === u.id ? t("ownerSelf") : p.owner,
                members: p.members,
              })}
            </span>
          </span>
          <span className="flex flex-col items-end gap-0.5">
            <span className="rounded-full bg-info-tint px-2.5 py-0.5 text-[13px] font-semibold text-info">{t(`roles.${p.role}`)}</span>
            {p.lastWork && <span className="text-xs text-ink-3">{t("lastWork", { when: whenText(p.lastWork, now, td) })}</span>}
          </span>
        </div>
      ))}
      {u.projects.length === 0 && <p className="m-0 border-b border-line-3 px-5 py-4 text-sm text-ink-3">{t("noProjects")}</p>}
      <p className="m-0 flex items-start gap-2 bg-surface-3 px-5 py-3 text-[13px] leading-[1.55] text-ink-2">
        <Icon name="lock" size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span>{u.status === "suspended" ? t("projNoteOff") : t("projNote")}</span>
      </p>
    </section>
  );
}
