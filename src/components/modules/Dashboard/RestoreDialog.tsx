"use client";

import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { daysUntil, formatDateTime } from "@/lib/dhakaTime";
import type { IDeletedProject } from "@/types/project.types";
import { useProjectLabels } from "../Projects/useProjectLabels";

type RestoreDialogProps = {
  project: IDeletedProject | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (project: IDeletedProject) => void;
};

// "ফিরিয়ে আনবেন?" with what coming back means for the books and the members.
export function RestoreDialog({ project, pending, onClose, onConfirm }: RestoreDialogProps) {
  const t = useTranslations("Dashboard.restoreDialog");
  const { t: tp } = useProjectLabels();
  if (!project) return null;

  const others = project.members.map((m) => `${m.name} (${tp(`role.${m.role}`)})`).join(", ");
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      icon="undo"
      title={t("title", { name: project.name })}
      subtitle={t("subtitle", { date: formatDateTime(new Date(project.deletedAt)), days: daysUntil(new Date(project.purgeAt)) })}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirm")}
      pending={pending}
      onConfirm={() => onConfirm(project)}
    >
      <ul className="m-0 mr-6 mb-4.5 ml-20.5 rounded-xl bg-brand-wash py-3 pr-3.5 pl-7.5 text-sm leading-[1.7] text-brand">
        <li>{t("pointBooks")}</li>
        {others && <li>{t("pointMembers", { names: others })}</li>}
        <li>{t("pointStatus")}</li>
      </ul>
    </ConfirmDialog>
  );
}
