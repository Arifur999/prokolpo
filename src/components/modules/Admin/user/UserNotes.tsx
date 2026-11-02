"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addNoteAction } from "@/app/(admin)/admin/(panel)/users/[userId]/_action";
import { TextArea } from "@/components/shared/form/TextArea";
import { whenText } from "@/lib/dayLabel";
import { cn } from "@/lib/utils";
import type { IAdminUserDetail } from "@/types/admin.types";

// "ভেতরের নোট" (board AdminUserDetail): staff-only notes on the account, newest first.
export function UserNotes({ u, now }: { u: IAdminUserDetail; now: string }) {
  const t = useTranslations("AdminUser");
  const td = useTranslations("Admin.dashboard");
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const empty = !note.trim();

  const add = () =>
    startTransition(async () => {
      const result = await addNoteAction(u.id, note);
      if (!result.success) return void toast.error(result.message);
      setNote("");
      toast.success(t("noteAdded"));
      router.refresh();
    });

  return (
    <section aria-labelledby="ud-notes" className="flex flex-col gap-3 rounded-2xl border border-line-2 bg-white px-4.5 pt-3.5 pb-4.5">
      <div className="flex flex-col">
        <h2 id="ud-notes" className="m-0 text-[17px] font-semibold">
          {t("notes")}
        </h2>
        <span className="text-[13px] text-ink-3">{t("notesSub")}</span>
      </div>
      <label htmlFor="ud-note" className="sr-only">
        {t("newNote")}
      </label>
      <TextArea
        id="ud-note"
        rows={3}
        maxLength={1000}
        placeholder={t("notePlaceholder")}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="text-sm"
      />
      <button
        type="button"
        onClick={add}
        disabled={empty || isPending}
        className={cn(
          "h-9.5 self-end rounded-[10px] border-none px-3.5 text-sm font-semibold text-white",
          empty ? "cursor-not-allowed bg-brand-soft" : "cursor-pointer bg-brand",
        )}
      >
        {t("addNote")}
      </button>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {u.notes.map((n, i) => (
          <li key={`${n.at}-${i}`} className="flex flex-col gap-0.5 rounded-[10px] bg-surface-2 px-3 py-2.5">
            <span className="text-xs text-ink-3">
              <strong className="font-semibold text-ink">{n.by}</strong> · {whenText(n.at, now, td)}
            </span>
            <span className="text-sm leading-[1.55]">{n.body}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
