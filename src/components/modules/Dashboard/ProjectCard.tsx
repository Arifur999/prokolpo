"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { projectHref } from "@/lib/routes";
import type { IProjectSummary } from "@/types/project.types";
import { useProjectLabels } from "../Projects/useProjectLabels";
import { CardPeople } from "./CardPeople";
import { CardProgress } from "./CardProgress";
import { ProjectCardMenu } from "./ProjectCardMenu";
import { StatusPill } from "./StatusPill";

// One project on the dashboard (board Dashboard, the cards in the grid).
export function ProjectCard({ project }: { project: IProjectSummary }) {
  const t = useTranslations("Dashboard.card");
  const { t: tp } = useProjectLabels();
  const stats = [
    { label: t("budgetLabel"), value: project.budget ? `৳ ${formatAmount(project.budget)}` : "—", ink: "text-ink" },
    { label: t("spentLabel"), value: `৳ ${formatAmount(project.spent)}`, ink: "text-danger" },
    { label: t("depositedLabel"), value: `৳ ${formatAmount(project.deposited)}`, ink: "text-success" },
  ];

  return (
    <article className="box-border flex h-full flex-col gap-3.5 rounded-[14px] border border-line-2 bg-white p-5 shadow-tile transition-[box-shadow,border-color] duration-150 hover:border-line-strong hover:shadow-tile-hover">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="box-border flex h-6 shrink-0 items-center rounded-md bg-brand px-2.25 text-xs font-semibold tracking-[0.2px] text-white">
            {t("number", { number: project.projectNo })}
          </span>
          {project.ownerCompany && (
            <span className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold text-brand">
              <Icon name="building2" size={14} strokeWidth={2} className="shrink-0" />
              <span className="truncate">{project.ownerCompany}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <StatusPill project={project} />
          <ProjectCardMenu project={project} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 text-lg leading-[1.35] font-semibold">{project.name}</h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {project.location && (
            <span className="flex items-center gap-1.5 text-[13px] text-ink-3">
              <Icon name="mapPin" size={14} strokeWidth={2} className="shrink-0" />
              {project.location}
            </span>
          )}
          <span className="box-border flex h-6 items-center gap-1.25 rounded-full border border-line px-2 text-xs font-semibold text-ink-2">
            <Icon name={project.ownership === "PARTNERSHIP" ? "users" : "home"} size={14} strokeWidth={2} />
            {tp(`ownership.${project.ownership}`)}
          </span>
        </div>
      </div>

      <CardPeople project={project} />

      <dl className="m-0 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-ink-3">{stat.label}</dt>
            <dd className={`m-0 text-[15px] leading-[1.35] font-semibold whitespace-nowrap ${stat.ink}`}>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <CardProgress project={project} />

      <Link
        href={projectHref(project.id)}
        aria-label={t("openAria", { name: project.name })}
        className="box-border flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-[15px] font-semibold text-white no-underline hover:bg-brand-deep hover:text-white"
      >
        {t("open")}
        <Icon name="arrowRight" size={16} strokeWidth={2} className="shrink-0" />
      </Link>
    </article>
  );
}
