"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BudgetBar } from "@/components/shared/BudgetBar";
import { Icon } from "@/components/shared/icon/Icon";
import { budgetPercent, budgetTone, formatAmount, formatPercent } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { IProjectSummary } from "@/types/project.types";
import { useProjectLabels } from "../Projects/useProjectLabels";
import { CardAlert } from "./CardAlert";
import { ProjectCardMenu } from "./ProjectCardMenu";
import { StatusPill } from "./StatusPill";

const PERCENT_INK = { ok: "text-ink", near: "text-gold-ink", over: "text-danger" } as const;

// One project on the dashboard (board Dashboard, the cards in the grid).
export function ProjectCard({ project }: { project: IProjectSummary }) {
  const t = useTranslations("Dashboard.card");
  const { t: tp, kindLine } = useProjectLabels();
  const percent = budgetPercent(project.spent, project.budget);
  const tone = percent === null ? "ok" : budgetTone(percent);

  return (
    <article className="box-border flex h-full flex-col gap-4 rounded-2xl border border-line-2 bg-white p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="box-border flex h-6.5 items-center gap-1.25 rounded-full border border-line px-2.5 text-[13px] font-semibold text-ink-2">
            <Icon name={project.ownership === "PARTNERSHIP" ? "users" : "home"} size={14} strokeWidth={2} />
            {tp(`ownership.${project.ownership}`)}
          </span>
          <StatusPill status={project.status} />
        </div>
        <ProjectCardMenu project={project} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-brand">
          <Icon name={KIND_ICON[project.kind]} size={15} strokeWidth={2} />
          {kindLine(project)}
        </span>
        <h2 className="m-0 text-[19px] leading-[1.35] font-semibold">
          <Link href={projectHref(project.id)} className="text-ink no-underline hover:text-ink hover:underline">
            {project.name}
          </Link>
        </h2>
        {project.location && (
          <span className="flex items-center gap-1.5 text-sm text-ink-3">
            <Icon name="mapPin" size={15} strokeWidth={2} />
            {project.location}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <span className="flex flex-col">
            <span className="text-[13px] text-ink-3">{t("totalSpent")}</span>
            <span className="text-[22px] leading-[1.3] font-semibold">৳ {formatAmount(project.spent)}</span>
          </span>
          {percent !== null && (
            <span className={cn("flex items-center gap-1 text-[15px] font-semibold", PERCENT_INK[tone])}>
              {tone === "over" && <Icon name="alertTriangle" size={14} strokeWidth={2.2} />}
              {formatPercent(percent)}
            </span>
          )}
        </div>
        {percent !== null && (
          <BudgetBar percent={percent} label={tp(tone === "over" ? "budgetPercentOver" : "budgetPercent", { percent: formatPercent(percent) })} />
        )}
        <span className="text-[13px] text-ink-3">{project.budget ? t("budget", { amount: formatAmount(project.budget) }) : t("noBudget")}</span>
      </div>

      <CardAlert project={project} tone={tone} />

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-3 pt-3.5 text-[13px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <Icon name="user" size={14} strokeWidth={2} />
          {t("yourRole")} <strong className="font-semibold text-ink">{tp(`role.${project.role}`)}</strong>
        </span>
        <span>{tp("members", { count: project.memberCount })}</span>
      </div>
    </article>
  );
}

const KIND_ICON = {
  BUILDING: "building",
  FARM: "egg",
  LAND: "map",
  BUSINESS: "shop",
  RENOVATION: "paintRoller",
  OTHER: "package",
} as const;
