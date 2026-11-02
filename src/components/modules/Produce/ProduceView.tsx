"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { collectFromBuyerAction } from "@/app/(dashboardLayout)/projects/[projectId]/farm-sales/_action";
import { CollectDueDialog } from "@/components/shared/CollectDueDialog";
import type { PickableAccount } from "@/components/shared/form/AccountPicker";
import { Icon } from "@/components/shared/icon/Icon";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { ExcelButton } from "@/components/shared/ExcelButton";
import { batchStarted } from "@/lib/produceLook";
import { produceSheet } from "@/lib/produceSheet";
import type { IBatch, IBuyerDue, IProduceBook } from "@/types/produce.types";
import type { FarmType } from "@/types/project.types";
import { BatchDialog } from "./BatchDialog";
import { BatchTable } from "./BatchTable";
import { BuyerDues } from "./BuyerDues";
import { IncomeMix } from "./IncomeMix";
import { ProduceSalesList } from "./ProduceSalesList";
import { ProduceSummary } from "./ProduceSummary";
import { ProduceSaleDialog } from "./sale/ProduceSaleDialog";

type ProduceViewProps = {
  projectId: string;
  projectName: string;
  farmType: FarmType;
  book: IProduceBook;
  accounts: PickableAccount[];
  today: string;
  canWrite: boolean;
};

type Open = { kind: "sale" } | { kind: "collect"; due: IBuyerDue } | { kind: "batch"; batch: IBatch } | null;

// The farm sales page (boards FarmSales, FarmSaleNew): totals, profit by batch, every sale,
// what buyers owe and where the money comes from.
export function ProduceView({ projectId, projectName, farmType, book, accounts, today, canWrite }: ProduceViewProps) {
  const t = useTranslations("Produce");
  const tf = useTranslations("Projects.farmType");
  const [open, setOpen] = useState<Open>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const setupName = book.setupName || t("setupFallback");
  const latest = book.batches.filter(batchStarted).at(-1);
  const head = [t("headLine", { project: projectName, type: tf(farmType) })];
  if (latest?.headCount) head.push(t("perBatch", { count: latest.headCount.toLocaleString("en-IN"), word: t(`headWord.${farmType}`) }));

  return (
    <>
      <ProjectPageHeader
        projectName={head.join(", ")}
        title={t("title")}
        subtitle={t("subtitle", { items: t(`items.${farmType}`) })}
        actions={
          <>
            <ExcelButton
              label={t("excel")}
              done={t("exported")}
              sheet={() => produceSheet(book, (key, values) => t(key as Parameters<typeof t>[0], values))}
              file={`${projectName} - ${t("title")}`}
            />
            {canWrite && (
              <button
                type="button"
                onClick={() => setOpen({ kind: "sale" })}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white"
              >
                <Icon name="plus" size={18} strokeWidth={2.2} />
                {t("new")}
              </button>
            )}
          </>
        }
      />
      <ProduceSummary book={book} farmType={farmType} setupName={setupName} />
      <BatchTable
        book={book}
        farmType={farmType}
        setupName={setupName}
        today={today}
        canWrite={canWrite}
        onEdit={(batch) => setOpen({ kind: "batch", batch })}
      />
      <div className="grid grid-cols-1 items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ProduceSalesList sales={book.sales} batches={book.batches} highlight={highlight} />
        <div className="flex flex-col gap-4.5">
          <BuyerDues dues={book.dues} canWrite={canWrite} onCollect={(due) => setOpen({ kind: "collect", due })} />
          <IncomeMix sales={book.sales} />
        </div>
      </div>
      {open?.kind === "sale" && (
        <ProduceSaleDialog
          projectId={projectId}
          projectName={projectName}
          book={book}
          accounts={accounts}
          today={today}
          onClose={() => setOpen(null)}
          onSaved={(id) => {
            setHighlight(id);
            setOpen(null);
          }}
        />
      )}
      {open?.kind === "collect" && (
        <CollectDueDialog
          namespace="Produce.collect"
          name={open.due.buyer}
          due={open.due.amount}
          accounts={accounts}
          save={(amount, accountId) => collectFromBuyerAction(projectId, open.due.buyerId, { amount, accountId })}
          onClose={() => setOpen(null)}
        />
      )}
      {open?.kind === "batch" && <BatchDialog projectId={projectId} batch={open.batch} farmType={farmType} today={today} onClose={() => setOpen(null)} />}
    </>
  );
}
