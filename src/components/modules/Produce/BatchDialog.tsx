"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBatchAction } from "@/app/(dashboardLayout)/projects/[projectId]/farm-sales/_action";
import { DateField } from "@/components/shared/form/DateField";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { toLatinDigits } from "@/lib/money";
import type { IBatch } from "@/types/produce.types";
import type { FarmType } from "@/types/project.types";

type BatchDialogProps = { projectId: string; batch: IBatch; farmType: FarmType; today: string; onClose: () => void };

const input = "box-border h-12 w-full rounded-lg border border-line bg-white px-3.5 text-base text-ink outline-none focus:border-brand focus:shadow-focus";

// A batch's dates, head count and losses, which the batch table reads (board FarmSales).
export function BatchDialog({ projectId, batch, farmType, today, onClose }: BatchDialogProps) {
  const t = useTranslations("Produce.batchForm");
  const router = useRouter();
  const [startedOn, setStartedOn] = useState(batch.startedOn ?? today);
  const [running, setRunning] = useState(!batch.endedOn);
  const [endedOn, setEndedOn] = useState(batch.endedOn ?? today);
  const [headCount, setHeadCount] = useState(batch.headCount ? String(batch.headCount) : "");
  const [losses, setLosses] = useState(batch.losses ? String(batch.losses) : "");
  const [note, setNote] = useState(batch.note ?? "");
  const [isPending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const result = await updateBatchAction(projectId, batch.id, {
        startedOn,
        endedOn: running ? "" : endedOn,
        headCount: headCount ? Number(headCount) : null,
        losses: Number(losses || 0),
        note,
      });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { name: batch.name }));
      onClose();
      router.refresh();
    });

  return (
    <FormDialog
      title={t("title")}
      subtitle={batch.name}
      closeLabel={t("title")}
      onClose={onClose}
      size="sm"
      footer={<DialogButtons cancel={t("cancel")} submit={t("save")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="b-start" className="text-[15px] font-semibold">
            {t("started")}
          </label>
          <DateField id="b-start" value={startedOn} onChange={setStartedOn} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="b-end" className="text-[15px] font-semibold">
            {t("ended")}
          </label>
          {running ? <span className="flex h-12 items-center text-[15px] text-ink-3">—</span> : <DateField id="b-end" value={endedOn} onChange={setEndedOn} />}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
        <input type="checkbox" checked={running} onChange={(event) => setRunning(event.target.checked)} className="m-0 size-5 accent-brand" />
        {t("running")}
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="b-heads" className="text-[15px] font-semibold">
            {t(`headCount.${farmType}`)}
          </label>
          <input
            id="b-heads"
            inputMode="numeric"
            value={headCount}
            onChange={(e) => setHeadCount(toLatinDigits(e.target.value).slice(0, 8))}
            className={input}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="b-loss" className="text-[15px] font-semibold">
            {t("losses")}
          </label>
          <input id="b-loss" inputMode="numeric" value={losses} onChange={(e) => setLosses(toLatinDigits(e.target.value).slice(0, 8))} className={input} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="b-note" className="text-[15px] font-semibold">
          {t("note")} <span className="font-normal text-ink-3">{t("optional")}</span>
        </label>
        <input id="b-note" maxLength={120} placeholder={t("notePlaceholder")} value={note} onChange={(e) => setNote(e.target.value)} className={input} />
      </div>
    </FormDialog>
  );
}
