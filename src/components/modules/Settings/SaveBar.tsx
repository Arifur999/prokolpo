"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SaveBarProps = {
  clean: boolean;
  // Overrides the "unsaved changes" line, e.g. when a name is missing.
  problem?: string;
  note?: string;
  pending: boolean;
  onReset: () => void;
  onSave: () => void;
};

// The grey bar under a settings form: whether anything is unsaved, then cancel and save.
export function SaveBar({ clean, problem, note, pending, onReset, onSave }: SaveBarProps) {
  const t = useTranslations("Settings");
  const blocked = clean || Boolean(problem) || pending;
  const text = problem ?? (clean ? (note ?? t("clean")) : t("dirty"));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line-3 bg-surface-3 px-5.5 py-3.5">
      <span className={cn("text-[13px]", problem ? "text-danger" : clean ? "text-ink-3" : "text-gold-ink")}>{text}</span>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onReset}
          disabled={clean || pending}
          className="h-11 cursor-pointer rounded-lg border border-line bg-white px-4 text-[15px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={blocked}
          className={cn(
            "h-11 rounded-lg border-none px-4.5 text-[15px] font-semibold text-white",
            blocked ? "cursor-not-allowed bg-brand-soft" : "cursor-pointer bg-brand",
          )}
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}
