"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { downloadSheets, type Sheet } from "@/lib/excel";
import { Icon } from "./icon/Icon";

type ExcelButtonProps = {
  label: string;
  // The toast while the file is made.
  done: string;
  file: string;
  sheet: () => Sheet | Sheet[];
};

// "Excel" in a page header (boards FarmSales, BizSales, Reports): saves what the page shows.
export function ExcelButton({ label, done, file, sheet }: ExcelButtonProps) {
  const [isPending, startTransition] = useTransition();
  const save = () =>
    startTransition(async () => {
      toast.success(done);
      const made = sheet();
      await downloadSheets(file, Array.isArray(made) ? made : [made]);
    });

  return (
    <button
      type="button"
      onClick={save}
      disabled={isPending}
      aria-busy={isPending}
      className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-line bg-white px-4 text-[15px] font-semibold text-ink disabled:cursor-default"
    >
      <Icon name={isPending ? "spinner" : "download"} size={18} strokeWidth={2} className={isPending ? "animate-spin" : undefined} />
      {label}
    </button>
  );
}
