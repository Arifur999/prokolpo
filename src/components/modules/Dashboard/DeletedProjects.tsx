"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { restoreProjectAction } from "@/app/(dashboardLayout)/(home)/dashboard/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { useProjectAction } from "@/hooks/useProjectAction";
import { daysUntil, formatDate, formatDateTime } from "@/lib/dhakaTime";
import type { IDeletedProject } from "@/types/project.types";
import { useProjectLabels } from "../Projects/useProjectLabels";
import { RestoreDialog } from "./RestoreDialog";

// Projects inside the restore window are flagged at the top once this few days remain.
const URGENT_DAYS = 3;

// The owner's restore list and, when one is about to be purged, the red alert above everything
// (board DashboardRestore).
export function DeletedProjects({ projects, children }: { projects: IDeletedProject[]; children?: React.ReactNode }) {
  const t = useTranslations("Dashboard");
  const { t: tp, kindLine } = useProjectLabels();
  const [restoring, setRestoring] = useState<IDeletedProject | null>(null);
  const { run, isPending } = useProjectAction(restoreProjectAction, restoring ? t("restoreDialog.done", { name: restoring.name }) : "");
  const urgent = projects.find((p) => daysUntil(new Date(p.purgeAt)) <= URGENT_DAYS);

  return (
    <>
      {urgent && (
        <div role="alert" className="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-danger-line bg-danger-tint px-4.5 py-3.5 text-danger-ink">
          <Icon name="alertCircle" size={22} strokeWidth={2} className="text-danger-strong" />
          <span className="flex min-w-60 grow flex-col">
            <strong className="text-[15px]">{t("deleted.urgentTitle", { name: urgent.name, days: daysUntil(new Date(urgent.purgeAt)) })}</strong>
            <span className="text-[13px] text-danger-ink-2">{t("deleted.urgentBody", { date: formatDate(new Date(urgent.purgeAt)) })}</span>
          </span>
          <button
            type="button"
            onClick={() => setRestoring(urgent)}
            className="h-10 shrink-0 cursor-pointer rounded-lg border-none bg-danger-strong px-4 text-sm font-semibold text-white"
          >
            {t("deleted.urgentCta")}
          </button>
        </div>
      )}

      {children}

      <section aria-labelledby="del-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-col gap-0.5 border-b border-canvas-deep px-5 py-3.5">
          <h2 id="del-title" className="m-0 flex items-center gap-2 text-[17px] font-semibold">
            {t("deleted.title")}
            <span className="box-border flex h-6 min-w-6 items-center justify-center rounded-full bg-danger-tint px-1.75 text-[13px] font-bold text-danger">
              {projects.length}
            </span>
          </h2>
          <span className="text-[13px] text-ink-3">{t("deleted.body")}</span>
        </div>
        {projects.map((project) => {
          const purgeAt = new Date(project.purgeAt);
          const others = project.members.map((m) => `${m.name} (${tp(`role.${m.role}`)})`).join(", ");
          return (
            <div key={project.id} className="flex flex-wrap items-center gap-4 border-t border-line-3 px-5 py-4 first-of-type:border-t-0">
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-4 text-ink-3">
                <Icon name="trash" size={22} />
              </span>
              <span className="flex min-w-0 grow basis-60 flex-col gap-0.5">
                <span className="text-base font-semibold">{project.name}</span>
                <span className="text-[13px] text-ink-2">
                  {kindLine({ ...project, floors: null })} · {tp(`ownership.${project.ownership}`)}
                </span>
                <span className="text-[13px] text-ink-3">
                  {t("deleted.deletedOn", { date: formatDateTime(new Date(project.deletedAt)) })}
                  {others && ` · ${t("deleted.membersLine", { names: others })}`}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <span className="rounded-full bg-danger-tint px-2.5 py-0.75 text-[13px] font-bold text-danger">
                  {t("deleted.purgeOn", { date: formatDate(purgeAt), days: daysUntil(purgeAt) })}
                </span>
                <button
                  type="button"
                  onClick={() => setRestoring(project)}
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border-none bg-brand px-4 text-sm font-semibold text-white"
                >
                  <Icon name="undo" size={16} strokeWidth={2.2} />
                  {t("deleted.restore")}
                </button>
              </span>
            </div>
          );
        })}
      </section>

      <p className="m-0 flex items-start gap-2 text-[13px] leading-[1.6] text-ink-3">
        <Icon name="info" size={16} strokeWidth={2} className="mt-0.5" />
        <span>{t("deleted.footnote")}</span>
      </p>

      <RestoreDialog
        project={restoring}
        pending={isPending}
        onClose={() => setRestoring(null)}
        onConfirm={async (project) => {
          if (await run(project.id)) setRestoring(null);
        }}
      />
    </>
  );
}
