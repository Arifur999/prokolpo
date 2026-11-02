import Link from "next/link";
import { useTranslations } from "next-intl";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IProfileProject } from "@/types/account.types";
import { ProfileCard } from "./ProfileCard";
import { ROLE_TONE } from "./profileLook";

// "আমার প্রজেক্ট ও রোল" (board Profile): each project with its kind and this account's role.
export function ProjectsCard({ projects }: { projects: IProfileProject[] }) {
  const t = useTranslations("Profile.projects");
  const tp = useTranslations("Projects");
  const owned = projects.filter((p) => p.role === "OWNER").length;
  return (
    <ProfileCard id="pf-proj" title={t("title")} sub={t("sub", { count: projects.length, owned })} compact>
      <ul className="m-0 list-none p-0">
        {projects.map((p) => {
          const kind = [tp(`kind.${p.kind}`), tp(`ownership.${p.ownership}`), p.status !== "ACTIVE" && tp(`status.${p.status}`)].filter(Boolean).join(" · ");
          return (
            <li key={p.id} className="flex items-center gap-2.5 border-b border-line-3 px-5 py-2.5">
              <span className="flex min-w-0 grow flex-col">
                <Link href={projectHref(p.id)} className="truncate text-[15px] font-semibold text-ink no-underline hover:text-brand">
                  {p.name}
                </Link>
                <span className="text-xs text-ink-3">{kind}</span>
              </span>
              <span className={cn("shrink-0 rounded-full px-2.25 py-px text-xs font-bold", ROLE_TONE[p.role])}>{tp(`role.${p.role}`)}</span>
            </li>
          );
        })}
      </ul>
      {projects.length === 0 && <p className="m-0 border-b border-line-3 px-5 py-3 text-sm text-ink-3">{t("none")}</p>}
      <p className="m-0 px-5 py-3 text-xs leading-[1.55] text-ink-3">{t("note")}</p>
    </ProfileCard>
  );
}
