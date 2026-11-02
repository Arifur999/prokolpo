"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { PayAccount } from "@/components/shared/PayDialog";
import { projectHref } from "@/lib/routes";
import type { IContractor } from "@/types/books.types";
import { ContractorPayDialog } from "./ContractorPayDialog";
import { ExtraWorkDialog } from "./ExtraWorkDialog";

type ContractorActionsProps = {
  projectId: string;
  contractor: IContractor;
  accounts: PayAccount[];
  weekWages: number;
  canWrite: boolean;
};

// The buttons at the top of a contractor's ledger: attendance or extra work, print, pay.
export function ContractorActions({ projectId, contractor: c, accounts, weekWages, canWrite }: ContractorActionsProps) {
  const t = useTranslations("ContractorLedger");
  const [dialog, setDialog] = useState<"pay" | "extra" | null>(null);
  const daily = c.payType === "DAILY";
  const button =
    "flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink no-underline hover:text-ink";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {daily ? (
        <Link href={projectHref(projectId, "contractors/attendance")} className={button}>
          <Icon name="calendarTick" size={18} />
          {t("attendance")}
        </Link>
      ) : (
        canWrite && (
          <button type="button" onClick={() => setDialog("extra")} className={button}>
            <Icon name="plus" size={18} strokeWidth={2.2} />
            {t("addExtra")}
          </button>
        )
      )}
      <button
        type="button"
        aria-label={t("print")}
        onClick={() => window.print()}
        className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-line bg-white text-ink"
      >
        <Icon name="printer" size={18} />
      </button>
      {canWrite && (
        <button
          type="button"
          onClick={() => setDialog("pay")}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
        >
          <Icon name="banknote" size={18} />
          {t("pay")}
        </button>
      )}
      {dialog === "pay" && (
        <ContractorPayDialog projectId={projectId} contractor={c} accounts={accounts} weekWages={weekWages} onClose={() => setDialog(null)} />
      )}
      {dialog === "extra" && (
        <ExtraWorkDialog projectId={projectId} contractorId={c.id} total={(c.contractAmount ?? 0) + c.extras} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
