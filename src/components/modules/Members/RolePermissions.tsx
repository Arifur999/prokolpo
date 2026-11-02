import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

// Which role may do what: owner, manager, viewer.
const ROWS = [
  { key: "view", allowed: [true, true, true] },
  { key: "write", allowed: [true, true, false] },
  { key: "team", allowed: [true, false, false] },
  { key: "settings", allowed: [true, false, false] },
] as const;

const ROLES = ["OWNER", "MANAGER", "VIEWER"] as const;

// "কোন রোলে কী করা যায়" beside the member list (board Members).
export function RolePermissions({ projectId }: { projectId: string }) {
  const t = useTranslations("Members");

  return (
    <aside aria-labelledby="perm-title" className="flex flex-col gap-3.5 rounded-2xl border border-line-2 bg-white p-5">
      <h2 id="perm-title" className="m-0 text-[17px] font-semibold">
        {t("permTitle")}
      </h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th scope="col" className="pb-2 text-left">
              <span className="sr-only">{t("permTask")}</span>
            </th>
            {ROLES.map((role) => (
              <th key={role} scope="col" className="w-14 pb-2 text-[13px] font-semibold text-ink-2">
                {t(`role.${role}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="border-t border-line-3 py-2.5 pr-2 text-left font-medium">
                {t(`perm.${row.key}`)}
              </th>
              {row.allowed.map((allowed, i) => (
                <td key={ROLES[i]} className={cn("border-t border-line-3 text-center", allowed ? "text-success" : "text-ink-disabled")}>
                  <Icon name={allowed ? "check" : "x"} size={16} strokeWidth={2.4} className="inline-block" />
                  <span className="sr-only">{allowed ? t("allowed") : t("notAllowed")}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="m-0 flex items-start gap-2 rounded-[10px] bg-surface-2 p-3 text-[13px] leading-[1.6] text-ink-2">
        <Icon name="info" size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
        {t("partnerTip")}
      </p>
      <p className="m-0 text-[13px] leading-[1.6] text-ink-3">
        {t.rich("activityTip", {
          link: (chunks) => (
            <Link href={projectHref(projectId, "activity")} className="font-semibold">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </aside>
  );
}
