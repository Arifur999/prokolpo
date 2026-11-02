"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { exportAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { downloadSheets } from "@/lib/excel";
import { ActionCard } from "./SettingsCard";

// "সব ডেটা ডাউনলোড" (board SettingsSupport): every book in one workbook, a sheet each.
export function BackupCard({ projectId, projectName, today }: { projectId: string; projectName: string; today: string }) {
  const t = useTranslations("Settings.backup");
  const [isPending, startTransition] = useTransition();
  const translate = (key: string) => t(key as Parameters<typeof t>[0]);
  const file = `${projectName.replace(/\s+/g, "-")}-${today.split("-").reverse().join("-")}`;

  const download = () =>
    startTransition(async () => {
      const result = await exportAction(projectId);
      if (!result.success) return void toast.error(result.message);
      if (!result.data.length) return void toast.info(t("empty"));
      await downloadSheets(
        file,
        result.data.map((sheet) => ({
          name: translate(`sheets.${sheet.key}`),
          header: sheet.columns.map((c) => translate(`columns.${c}`)),
          rows: sheet.rows,
          widths: sheet.columns.map((c) => (c === "date" ? 12 : c === "amount" || c === "cash" || c === "mobile" || c === "other" ? 14 : 24)),
        })),
      );
      toast.success(t("done", { file: `${file}.xlsx` }));
    });

  return (
    <ActionCard
      id="st-backup"
      title={t("title")}
      body={t("body")}
      action={
        <button
          type="button"
          onClick={download}
          disabled={isPending}
          className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink disabled:cursor-wait disabled:opacity-70"
        >
          <Icon name="download" size={18} strokeWidth={2} />
          {t("button")}
        </button>
      }
    />
  );
}
