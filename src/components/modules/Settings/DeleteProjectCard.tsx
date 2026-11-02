"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProjectAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ROUTES } from "@/lib/routes";
import type { ISettings } from "@/types/settings.types";
import { ActionCard } from "./SettingsCard";

// "প্রজেক্ট মুছুন" (board SettingsDelete): typing the name exactly unlocks the delete; the
// project then waits 30 days in the dashboard's restore list.
export function DeleteProjectCard({ projectId, projectName, counts }: { projectId: string; projectName: string; counts: ISettings["counts"] }) {
  const t = useTranslations("Settings.delete");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [isPending, startTransition] = useTransition();
  const matches = typed.trim() === projectName;

  const remove = () =>
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done"));
      router.push(ROUTES.dashboard);
    });

  const summary = t("summary", { expenses: counts.expenses, sales: counts.sales, partners: counts.partners, receipts: counts.receipts });
  return (
    <ActionCard
      id="st-delete"
      tone="danger"
      title={t("title")}
      body={t("body")}
      action={
        <button
          type="button"
          onClick={() => {
            setTyped("");
            setOpen(true);
          }}
          className="h-11 shrink-0 cursor-pointer rounded-lg border border-danger-strong bg-white px-4 text-[15px] font-semibold text-danger"
        >
          {t("button")}
        </button>
      }
    >
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        icon="trash"
        tone="danger"
        title={t("confirmTitle", { name: projectName })}
        subtitle={t("confirmBody", { summary, members: Math.max(0, counts.members - 1) })}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        pending={isPending || !matches}
        onConfirm={() => matches && remove()}
      >
        <div className="flex flex-col gap-1.5 px-6 pb-4.5 sm:pl-20.5">
          <label htmlFor="st-del-name" className="text-sm font-semibold">
            {t("typeName")}
          </label>
          <input
            id="st-del-name"
            placeholder={projectName}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="box-border h-11 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand"
          />
        </div>
      </ConfirmDialog>
    </ActionCard>
  );
}
