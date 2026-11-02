"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { transferAction } from "@/app/(dashboardLayout)/projects/[projectId]/settings/_action";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { ITransferMember } from "@/types/settings.types";
import { ActionCard } from "./SettingsCard";
import { useSettingsSave } from "./useSettingsSave";

// "মালিকানা অন্যকে দিন" (board SettingsSupport): hand the project to a member; the owner
// stays on as a manager.
export function TransferCard({ projectId, members }: { projectId: string; members: ITransferMember[] }) {
  const t = useTranslations("Settings.transfer");
  const tp = useTranslations("Projects");
  const [picked, setPicked] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const { run, isPending } = useSettingsSave();
  const chosen = members.find((m) => m.userId === picked);

  return (
    <ActionCard id="st-transfer" title={t("title")} body={t("body")}>
      {members.length === 0 ? (
        <p className="m-0 text-sm text-ink-3">{t("none")}</p>
      ) : (
        <>
          <div role="radiogroup" aria-label={t("pick")} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <label
                key={m.userId}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl",
                  picked === m.userId ? "border-2 border-brand bg-brand-wash px-3.25 py-2.75" : "border border-line bg-white px-3.5 py-3",
                )}
              >
                <input
                  type="radio"
                  name="st-owner"
                  checked={picked === m.userId}
                  onChange={() => setPicked(m.userId)}
                  className="m-0 size-4.5 shrink-0 accent-brand"
                />
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold">{m.name}</span>
                  <span className="text-xs text-ink-3">
                    {[tp(`role.${m.role}`), m.share !== null && t("share", { share: m.share })].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!chosen || isPending}
              onClick={() => setConfirming(true)}
              className={cn(
                "h-11 rounded-lg border bg-white px-4 text-[15px] font-semibold",
                chosen ? "cursor-pointer border-brand text-brand" : "cursor-not-allowed border-line text-ink-5",
              )}
            >
              {chosen ? t("button", { name: chosen.name }) : t("pickFirst")}
            </button>
          </div>
        </>
      )}
      {chosen && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          icon="crown"
          title={t("confirmTitle", { name: chosen.name })}
          subtitle={t("confirmBody", { name: chosen.name })}
          confirmLabel={t("button", { name: chosen.name })}
          cancelLabel={t("cancel")}
          pending={isPending}
          onConfirm={() =>
            run(
              () => transferAction(projectId, chosen.userId),
              t("done", { name: chosen.name }),
              () => setConfirming(false),
            )
          }
        />
      )}
    </ActionCard>
  );
}
