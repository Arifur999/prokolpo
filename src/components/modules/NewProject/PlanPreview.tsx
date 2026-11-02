"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { formatAmount } from "@/lib/money";
import type { Plan } from "@/lib/projectPlan";
import { cn } from "@/lib/utils";
import type { NewProjectValues } from "./newProjectValues";

type PlanPreviewProps = {
  values: NewProjectValues;
  plan: Plan;
  plotNames: string[];
};

// tight: a one-line note under the title instead of a row of chips.
function Row({ icon, title, gold, tight, children }: { icon: IconName; title: string; gold?: boolean; tight?: boolean; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px]", gold ? "bg-gold-tint text-gold-ink" : "bg-brand-tint text-brand")}>
        <Icon name={icon} size={18} />
      </span>
      <div className={cn("flex min-w-0 flex-col", tight ? "gap-0.5" : "gap-2")}>
        <span className="text-[15px] font-semibold">{title}</span>
        {children}
      </div>
    </div>
  );
}

function Chips({ items, className }: { items: string[]; className: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={cn("rounded-full px-2.25 py-px text-[13px]", className)}>
          {item}
        </span>
      ))}
    </div>
  );
}

// The green-headed card beside the form: what the project will start with (board NewProject).
export function PlanPreview({ values, plan, plotNames }: PlanPreviewProps) {
  const t = useTranslations("NewProject");
  const tp = useTranslations("NewProject.preview");
  const tProjects = useTranslations("Projects");
  const tMenus = useTranslations("ProjectTemplates.menus");
  const budget = Number(values.budget || 0);
  const kindLabel = values.kind === "FARM" ? `${tProjects("kind.FARM")} · ${tProjects(`farmType.${values.farmType}`)}` : t(`kinds.${values.kind}.label`);

  return (
    <aside aria-labelledby="np-preview-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white lg:sticky lg:top-6">
      <div className="flex flex-col gap-2.5 bg-brand px-6 py-5.5 text-white">
        <span id="np-preview-title" className="text-[13px] font-semibold text-white/72">
          {tp("title")}
        </span>
        <span className="text-[19px] leading-[1.35] font-semibold">{values.name.trim() || tp("untitled")}</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="box-border flex h-6.5 items-center rounded-full bg-white/12 px-2.5 text-[13px] font-semibold">{kindLabel}</span>
          <span className="box-border flex h-6.5 items-center rounded-full bg-gold/20 px-2.5 text-[13px] font-semibold text-gold-light">
            {tProjects(`ownership.${values.ownership}`)}
          </span>
          <span className="text-sm text-white/80">{budget ? tp("budget", { amount: formatAmount(budget) }) : tp("noBudget")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-6 pt-5.5 pb-6">
        <div className="flex flex-col gap-0.5">
          <h2 className="m-0 text-base font-semibold">{tp("readyTitle")}</h2>
          <p className="m-0 text-[13px] text-ink-3">{tp("readyHint")}</p>
        </div>

        <Row icon="user" title={tp("owner")} tight>
          <span className="text-[13px] text-ink-3">{tp("ownerHint")}</span>
        </Row>
        <Row icon="tag" title={tp("categories", { count: plan.categories.length })}>
          <Chips items={plan.categories} className="bg-surface-4 text-ink-2" />
        </Row>
        <Row icon="wallet" title={tp("cash")} tight>
          <span className="text-[13px] text-ink-3">{tp("cashHint")}</span>
        </Row>
        <Row icon="activity" title={plan.phases.length ? tp("phases", { count: plan.phases.length }) : tp("phasesNone")}>
          {plan.phases.length ? (
            <Chips items={plan.phases} className="bg-brand-tint font-medium text-success" />
          ) : (
            <span className="text-[13px] text-ink-3">{tp(values.kind === "BUILDING" ? "phasesFloors" : "phasesLater")}</span>
          )}
        </Row>
        {plotNames.length > 0 && (
          <Row icon="grid" title={tp("plots", { count: plotNames.length })}>
            <Chips items={plotNames} className="bg-surface-4 text-ink-2" />
          </Row>
        )}
        <Row icon="menu" title={tp("menusTitle")} gold>
          {plan.menus.length > 0 && <Chips items={plan.menus.map((menu) => tMenus(menu))} className="bg-gold-tint font-medium text-gold-ink" />}
          <span className="text-[13px] text-ink-3">{tp(`menuNotes.${plan.menuNote}`)}</span>
        </Row>
      </div>
    </aside>
  );
}
