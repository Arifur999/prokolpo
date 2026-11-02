"use client";

import { useTranslations } from "next-intl";
import { useState, type DragEvent } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

export const MAX_MEMO_BYTES = 5 * 1024 * 1024;

type MemoPickerProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  // A photo already attached, for the edit page.
  currentHref?: string | null;
};

const sizeText = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

// "মেমোর ছবি": drop or choose one photo of the paper memo, up to 5MB.
export function MemoPicker({ file, onChange, currentHref }: MemoPickerProps) {
  const t = useTranslations("ExpenseForm");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const take = (picked: File | undefined) => {
    if (!picked) return;
    if (!/^image\/(jpeg|png|webp)$/.test(picked.type)) return setError(t("memoNotImage"));
    if (picked.size > MAX_MEMO_BYTES) return setError(t("memoTooBig"));
    setError(null);
    onChange(picked);
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[15px] font-semibold">
        {t("memo")} <span className="font-normal text-ink-3">{t("optional")}</span>
      </span>
      {file ? (
        <div className="flex min-h-28 grow items-center gap-3 rounded-lg border border-line bg-surface-3 p-3.5">
          <Icon name="image" size={22} className="text-brand" />
          <span className="min-w-0 grow truncate text-sm font-semibold">{t("memoChosen", { name: file.name, size: sizeText(file.size) })}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="h-9 cursor-pointer rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink"
          >
            {t("memoRemove")}
          </button>
        </div>
      ) : (
        <label
          htmlFor="ex-memo"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
          className={cn(
            "box-border flex min-h-28 grow cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed p-3.5 text-center",
            dragging ? "border-brand bg-brand-wash" : "border-line-strong bg-surface-3",
          )}
        >
          <span className="flex text-ink-2">
            <Icon name="upload" size={24} />
          </span>
          <span className="text-sm font-semibold">
            {currentHref ? t("memoReplace") : t("memoDrop")} <span className="text-brand underline">{t("memoPick")}</span>
          </span>
          <span className="text-[13px] text-ink-3">{t("memoHint")}</span>
          {currentHref && (
            <a href={currentHref} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="text-[13px] font-semibold">
              {t("memoCurrent")} · {t("memoView")}
            </a>
          )}
        </label>
      )}
      <input id="ex-memo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => take(event.target.files?.[0])} className="sr-only" />
      {error && <p className="m-0 text-sm text-danger">{error}</p>}
    </div>
  );
}
