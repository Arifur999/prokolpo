"use client";

import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon/Icon";
import type { IconName } from "./icon/iconPaths";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon: IconName;
  tone?: "brand" | "danger";
  children?: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
};

const TONE = {
  brand: { well: "bg-brand-tint text-success", button: "bg-brand" },
  danger: { well: "bg-danger-tint text-danger", button: "bg-danger-strong" },
};

// The centred yes/no dialog with an icon, as the restore board draws it (DashboardRestore).
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  tone = "brand",
  children,
  cancelLabel,
  confirmLabel,
  onConfirm,
  pending,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Content className="fixed top-30 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-135 -translate-x-1/2 flex-col overflow-hidden rounded-[20px] bg-white text-ink shadow-dialog">
          <div className="flex items-start gap-3.5 px-6 pt-5 pb-3.5">
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", TONE[tone].well)}>
              <Icon name={icon} size={22} strokeWidth={2} />
            </span>
            <div className="flex flex-col gap-1">
              <Dialog.Title className="m-0 text-xl font-semibold">{title}</Dialog.Title>
              {subtitle ? (
                <Dialog.Description className="m-0 text-sm text-ink-3">{subtitle}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
          </div>
          {children}
          <div className="flex justify-end gap-2.5 border-t border-line-3 bg-surface-3 px-6 py-3.5">
            <Dialog.Close className="h-11 cursor-pointer rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink">
              {cancelLabel}
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              aria-busy={pending}
              className={cn(
                "h-11 cursor-pointer rounded-lg border-none px-4.5 text-[15px] font-semibold text-white disabled:cursor-wait disabled:opacity-80",
                TONE[tone].button,
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
