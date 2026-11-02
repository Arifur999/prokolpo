"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { PayAccount } from "@/components/shared/PayDialog";
import type { ISupplier } from "@/types/books.types";
import { SupplierPayDialog } from "./SupplierPayDialog";

// "পেমেন্ট দিন" at the top of a supplier's ledger.
export function LedgerPayButton({ projectId, supplier, accounts, label }: { projectId: string; supplier: ISupplier; accounts: PayAccount[]; label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-brand bg-brand px-4.5 text-[15px] font-semibold text-white"
      >
        <Icon name="banknote" size={18} />
        {label}
      </button>
      {open && <SupplierPayDialog projectId={projectId} supplier={supplier} accounts={accounts} onClose={() => setOpen(false)} />}
    </>
  );
}
