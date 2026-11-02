"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { cn } from "@/lib/utils";
import type { ITeam } from "@/types/members.types";
import { InviteDialog } from "./InviteDialog";
import { MEMBER_GRID, MemberRow } from "./MemberRow";
import { PendingInvites } from "./PendingInvites";
import { ResetCodeDialog } from "./ResetCodeDialog";
import { RolePermissions } from "./RolePermissions";

type MembersViewProps = { projectId: string; projectName: string; team: ITeam; isOwner: boolean };

// The members page (board Members): the team with roles, pending invitations, and what
// each role may do. Only the owner sees the add, reset and remove controls.
export function MembersView({ projectId, projectName, team, isOwner }: MembersViewProps) {
  const t = useTranslations("Members");
  const [inviting, setInviting] = useState(false);
  const [confirmId, setConfirmId] = useState("");
  const [resetId, setResetId] = useState("");
  const resetFor = team.members.find((m) => m.userId === resetId);

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          isOwner && (
            <button
              type="button"
              onClick={() => setInviting(true)}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white"
            >
              <Icon name="userPlus" size={20} strokeWidth={2} />
              {t("add")}
            </button>
          )
        }
      />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5.5">
          <section aria-labelledby="mb-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-2 px-5 py-4">
              <h2 id="mb-title" className="m-0 text-[17px] font-semibold">
                {t("listTitle", { count: team.members.length })}
              </h2>
              <span className="text-[13px] text-ink-3">{t("ownerOnly")}</span>
            </div>
            <div role="table" aria-labelledby="mb-title">
              <div
                role="row"
                className={cn("hidden h-10.5 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2 lg:grid", MEMBER_GRID)}
              >
                <span role="columnheader">{t("colMember")}</span>
                <span role="columnheader">{t("colRole")}</span>
                <span role="columnheader">{t("colLast")}</span>
                <span role="columnheader" className="pr-2 text-right">
                  {t("colEntries")}
                </span>
                <span role="columnheader">
                  <span className="sr-only">{t("colActions")}</span>
                </span>
              </div>
              {team.members.map((member) => (
                <MemberRow
                  key={member.userId}
                  projectId={projectId}
                  member={member}
                  isOwner={isOwner}
                  confirming={confirmId === member.userId}
                  onAskRemove={(ask) => setConfirmId(ask ? member.userId : "")}
                  onReset={() => {
                    setConfirmId("");
                    setResetId(member.userId);
                  }}
                />
              ))}
            </div>
          </section>
          <PendingInvites projectId={projectId} projectName={projectName} invites={team.invites} isOwner={isOwner} />
        </div>
        <RolePermissions projectId={projectId} />
      </div>
      {inviting && <InviteDialog projectId={projectId} onClose={() => setInviting(false)} />}
      {resetFor && <ResetCodeDialog projectId={projectId} member={resetFor} onClose={() => setResetId("")} />}
    </>
  );
}
