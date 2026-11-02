"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DropdownMenu } from "radix-ui";
import { useState } from "react";
import { deleteProjectAction } from "@/app/(dashboardLayout)/(home)/dashboard/_action";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { useProjectAction } from "@/hooks/useProjectAction";
import { projectHref } from "@/lib/routes";
import type { IProjectSummary } from "@/types/project.types";

const itemClass =
  "flex h-10 cursor-pointer items-center rounded-lg px-2.5 text-[15px] text-ink no-underline outline-none hover:text-ink data-highlighted:bg-surface-2";

// The ⋮ button on a card: open the project, and for its owner, delete it (restorable for 30 days).
export function ProjectCardMenu({ project }: { project: IProjectSummary }) {
  const t = useTranslations("Dashboard");
  const [confirming, setConfirming] = useState(false);
  const { run, isPending } = useProjectAction(deleteProjectAction, t("deleteDialog.done", { name: project.name }));

  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger
          aria-label={t("card.moreOptions", { name: project.name })}
          className="-my-1.5 -mr-2 flex size-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-3 hover:bg-surface-2"
        >
          <Icon name="moreVertical" size={18} strokeWidth={2} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={4} className="z-40 flex w-48 flex-col rounded-xl border border-line-2 bg-white p-1.5 shadow-raised">
            <DropdownMenu.Item asChild className={itemClass}>
              <Link href={projectHref(project.id)}>{t("card.open")}</Link>
            </DropdownMenu.Item>
            {project.role === "OWNER" && (
              <DropdownMenu.Item onSelect={() => setConfirming(true)} className={`${itemClass} text-danger`}>
                {t("card.delete")}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        icon="trash"
        tone="danger"
        title={t("deleteDialog.title", { name: project.name })}
        cancelLabel={t("deleteDialog.cancel")}
        confirmLabel={t("deleteDialog.confirm")}
        pending={isPending}
        onConfirm={async () => {
          if (await run(project.id)) setConfirming(false);
        }}
      >
        <p className="m-0 mr-6 mb-4.5 ml-20.5 text-sm leading-[1.6] text-ink-2">{t("deleteDialog.body")}</p>
      </ConfirmDialog>
    </>
  );
}
