"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createAccountAction } from "@/app/(dashboardLayout)/projects/[projectId]/accounts/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import type { AccountKind } from "@/types/books.types";
import { ACCOUNT_ICON } from "./accountLook";

const KINDS: AccountKind[] = ["CASH", "BANK", "MOBILE"];

// "নতুন অ্যাকাউন্ট": where some of the project's money is kept, and how much is there now.
export function AccountFormDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const t = useTranslations("Accounts.accountDialog");
  const tk = useTranslations("Accounts");
  const router = useRouter();
  const [kind, setKind] = useState<AccountKind>("BANK");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [opening, setOpening] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const save = () => {
    setSubmitted(true);
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createAccountAction(projectId, { name: name.trim(), kind, number: number.trim(), opening: Number(opening || 0) });
      if (!result.success) {
        setServerError(result.fieldErrors?.name);
        return void toast.error(result.message);
      }
      toast.success(t("added", { name: result.data.name }));
      onClose();
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle")}
      closeLabel={t("close")}
      onClose={onClose}
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div role="radiogroup" aria-labelledby="ac-type-title" className="flex flex-col gap-2">
        <span id="ac-type-title" className="text-[15px] font-semibold">
          {t("type")}
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {KINDS.map((value) => {
            const on = value === kind;
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl text-sm font-semibold",
                  on ? "border-2 border-brand bg-brand-wash p-2.75" : "border border-line bg-white p-3",
                )}
              >
                <input type="radio" name="ac-type" checked={on} onChange={() => setKind(value)} className="sr-only" />
                <Icon name={ACCOUNT_ICON[value]} size={18} className="text-brand" />
                {tk(`kind${value}`)}
              </label>
            );
          })}
        </div>
      </div>
      <LabeledInput
        id="ac-name"
        autoFocus
        aria-required="true"
        maxLength={60}
        label={
          <>
            {t("name")} <span className="text-danger">*</span>
          </>
        }
        placeholder={t("namePlaceholder")}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setServerError(undefined);
        }}
        error={serverError ?? (submitted && !name.trim() ? t("nameError") : undefined)}
      />
      <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-2">
        <LabeledInput
          id="ac-number"
          label={t(`number${kind}`)}
          labelNote={t("optional")}
          maxLength={60}
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          hint={kind === "BANK" ? t("numberHintBANK") : undefined}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ac-opening" className="text-[15px] font-semibold">
            {t("opening")}
          </label>
          <MoneyInput id="ac-opening" placeholder="0" value={opening} onChange={setOpening} aria-describedby="ac-opening-help" />
        </div>
      </div>
      <p id="ac-opening-help" className="m-0 text-[13px] text-ink-3">
        {t("openingHelp")}
      </p>
    </FormDialog>
  );
}
