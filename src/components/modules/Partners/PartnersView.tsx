"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { Icon } from "@/components/shared/icon/Icon";
import type { IPartner, IPartnerBoard } from "@/types/partners.types";
import { CallDialog } from "./CallDialog";
import { CapitalCalls } from "./CapitalCalls";
import { DepositDialog } from "./DepositDialog";
import { NewPartnerDialog } from "./NewPartnerDialog";
import { PartnerSummary } from "./PartnerSummary";
import { PartnerTable } from "./PartnerTable";
import { ShareBar } from "./ShareBar";

type PartnersViewProps = {
  projectId: string;
  projectName: string;
  board: IPartnerBoard;
  accounts: PickableAccount[];
  today: string;
  isOwner: boolean;
  canWrite: boolean;
};

type Dialog = { kind: "new" } | { kind: "call" } | { kind: "deposit"; partner: IPartner } | null;

// The partners page (boards PartnerList, PartnerCapitalCall, PartnerNew): shares, what each
// partner owes, capital calls, and the dialogs that change them.
export function PartnersView({ projectId, projectName, board, accounts, today, isOwner, canWrite }: PartnersViewProps) {
  const t = useTranslations("Partners");
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const button = "flex h-11 cursor-pointer items-center gap-2 rounded-[10px] text-[15px] font-semibold";

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          isOwner && (
            <>
              <button type="button" onClick={() => setDialog({ kind: "new" })} className={`${button} border border-line bg-white px-4 text-ink`}>
                <Icon name="userPlus" size={18} strokeWidth={2} />
                {t("add")}
              </button>
              {board.partners.length > 0 && (
                <button type="button" onClick={() => setDialog({ kind: "call" })} className={`${button} border-none bg-brand pr-4.5 pl-3.5 text-white`}>
                  <Icon name="plus" size={18} strokeWidth={2.2} />
                  {t("newCall")}
                </button>
              )}
            </>
          )
        }
      />
      <PartnerSummary partners={board.partners} />
      {board.partners.length > 0 && <ShareBar partners={board.partners} />}
      <PartnerTable projectId={projectId} partners={board.partners} canWrite={canWrite} onDeposit={(partner) => setDialog({ kind: "deposit", partner })} />
      <CapitalCalls calls={board.calls} onNew={isOwner && board.partners.length > 0 ? () => setDialog({ kind: "call" }) : undefined} />

      {dialog?.kind === "new" && <NewPartnerDialog projectId={projectId} projectName={projectName} partners={board.partners} today={today} onClose={close} />}
      {dialog?.kind === "call" && <CallDialog projectId={projectId} projectName={projectName} partners={board.partners} today={today} onClose={close} />}
      {dialog?.kind === "deposit" && (
        <DepositDialog
          projectId={projectId}
          partner={dialog.partner}
          calls={board.calls.filter((c) => c.parts.some((p) => p.partnerId === dialog.partner.id))}
          accounts={accounts}
          onClose={close}
        />
      )}
    </>
  );
}
