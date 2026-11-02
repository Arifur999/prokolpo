"use client";

import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon/Icon";

type FormDialogProps = {
  title: string;
  subtitle?: string;
  closeLabel: string;
  onClose: () => void;
  // Content between the header and the body, edge to edge (the payee band in a payment).
  band?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  // 600px for a short form, 680px for a payment.
  size?: "md" | "lg";
  topClass?: string;
};

// A modal form card: title and close at the top, fields, and a grey footer of actions
// (boards SupplierAdd, SupplierPay, ContractorAdd, AccountsTransfer).
export function FormDialog({ title, subtitle, closeLabel, onClose, band, footer, children, size = "md", topClass = "top-16" }: FormDialogProps) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 flex-col overflow-hidden rounded-[20px] bg-white text-ink shadow-dialog",
            size === "lg" ? "max-w-170" : "max-w-150",
            topClass,
          )}
        >
          <div className={cn("flex items-start justify-between gap-4 border-b border-line-3 px-6", subtitle ? "pt-5.5 pb-4.5" : "py-4.5")}>
            <div className="flex flex-col gap-0.5">
              <Dialog.Title className="m-0 text-xl leading-[1.4] font-semibold">{title}</Dialog.Title>
              {subtitle ? (
                <Dialog.Description className="m-0 text-sm text-ink-3">{subtitle}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label={closeLabel}
              className="-mt-1.5 -mr-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-ink-2"
            >
              <Icon name="x" size={20} strokeWidth={2} />
            </Dialog.Close>
          </div>
          {band}
          <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">{children}</div>
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line-3 bg-surface-3 px-6 py-4">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// The two buttons most dialogs end with.
export function DialogButtons({
  cancel,
  submit,
  onCancel,
  onSubmit,
  pending,
  disabled,
}: {
  cancel: string;
  submit: string;
  onCancel: () => void;
  onSubmit: () => void;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="h-11.5 cursor-pointer rounded-xl border border-line bg-white px-4.5 text-[15px] font-semibold text-ink"
      >
        {cancel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={pending || disabled}
        aria-busy={pending}
        className={cn(
          "flex h-11.5 cursor-pointer items-center gap-2 rounded-xl border-none px-5 text-[15px] font-semibold text-white disabled:cursor-default",
          disabled ? "bg-ink-5" : pending ? "bg-brand-busy" : "bg-brand",
        )}
      >
        {pending && <Icon name="spinner" size={18} strokeWidth={2.4} className="animate-spin" />}
        {submit}
      </button>
    </div>
  );
}
