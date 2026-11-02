"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { Icon } from "@/components/shared/icon/Icon";
import { projectHref } from "@/lib/routes";
import type { ISale } from "@/types/sales.types";
import { CollectDialog } from "./CollectDialog";
import { DueCards } from "./DueCards";
import { SalesSummary } from "./SalesSummary";
import { SalesTable } from "./SalesTable";

type SalesViewProps = { projectId: string; projectName: string; sales: ISale[]; accounts: PickableAccount[]; today: string; canWrite: boolean };

// The sales page (board SalesList): totals, late and this month's installments, and every sale.
export function SalesView({ projectId, projectName, sales, accounts, today, canWrite }: SalesViewProps) {
  const t = useTranslations("Sales");
  const [collecting, setCollecting] = useState<ISale | null>(null);

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          canWrite && (
            <Link
              href={projectHref(projectId, "sales/new")}
              className="flex h-11 items-center gap-2 rounded-[10px] bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white no-underline hover:text-white"
            >
              <Icon name="plus" size={18} strokeWidth={2.2} />
              {t("new")}
            </Link>
          )
        }
      />
      <SalesSummary sales={sales} />
      <DueCards sales={sales} today={today} projectName={projectName} canWrite={canWrite} onCollect={setCollecting} />
      <SalesTable projectId={projectId} sales={sales} canWrite={canWrite} onCollect={setCollecting} />
      {collecting && <CollectDialog projectId={projectId} sale={collecting} accounts={accounts} onClose={() => setCollecting(null)} />}
    </>
  );
}
