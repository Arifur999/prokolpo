"use client";

import { useRouter } from "next/navigation";
import { useMessages, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createSupplierAction } from "@/app/(dashboardLayout)/projects/[projectId]/suppliers/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { displayPhone, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

type SupplierFormDialogProps = {
  projectId: string;
  onClose: () => void;
  onAdded?: (id: string) => void;
};

// "নতুন সাপ্লায়ার" (board SupplierAdd). An opening due starts their ledger.
export function SupplierFormDialog({ projectId, onClose, onAdded }: SupplierFormDialogProps) {
  const t = useTranslations("Suppliers.form");
  const kinds = useMessages().Lists.supplies;
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [supplies, setSupplies] = useState<string[]>([]);
  const [opening, setOpening] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const normalized = phone ? normalizePhone(phone) : null;
  const nameError =
    serverErrors.name ?? (submitted ? (!name.trim() ? t("validation.name") : name.trim().length < 2 ? t("validation.nameShort") : undefined) : undefined);
  const phoneError = serverErrors.phone ?? (submitted && phone && !normalized ? t("validation.phone") : undefined);
  const phoneHint = normalized && normalized !== phone ? t("phoneSaved", { phone: displayPhone(normalized) }) : undefined;

  const toggle = (kind: string) => setSupplies((list) => (list.includes(kind) ? list.filter((k) => k !== kind) : [...list, kind]));

  const save = () => {
    setSubmitted(true);
    if (!name.trim() || name.trim().length < 2 || (phone && !normalized)) return;
    startTransition(async () => {
      const result = await createSupplierAction(projectId, {
        name: name.trim(),
        phone: normalized ?? "",
        address: address.trim(),
        supplies,
        openingDue: Number(opening || 0),
        note: note.trim(),
      });
      if (!result.success) {
        setServerErrors(result.fieldErrors ?? {});
        return void toast.error(result.message);
      }
      toast.success(t("added", { name: result.data.name }));
      onAdded?.(result.data.id);
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
      <LabeledInput
        id="sp-name"
        label={
          <>
            {t("name")} <span className="text-danger">*</span>
          </>
        }
        aria-required="true"
        autoFocus
        maxLength={80}
        placeholder={t("namePlaceholder")}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setServerErrors((errors) => ({ ...errors, name: "" }));
        }}
        error={nameError}
      />
      <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-2">
        <LabeledInput
          id="sp-phone"
          type="tel"
          label={t("phone")}
          labelNote={t("optional")}
          placeholder={t("phonePlaceholder")}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={phoneError}
          success={phoneHint}
        />
        <LabeledInput
          id="sp-address"
          label={t("address")}
          labelNote={t("optional")}
          maxLength={120}
          placeholder={t("addressPlaceholder")}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <div role="group" aria-labelledby="sp-supplies-title" className="flex flex-col gap-2">
        <span id="sp-supplies-title" className="text-[15px] font-semibold">
          {t("supplies")} <span className="font-normal text-ink-3">{t("suppliesNote")}</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((kind) => {
            const on = supplies.includes(kind);
            return (
              <label
                key={kind}
                className={cn(
                  "relative box-border flex h-8.5 cursor-pointer items-center gap-1.25 rounded-full px-3 text-sm has-focus-visible:shadow-focus",
                  on ? "border-[1.5px] border-brand bg-brand-wash font-semibold text-brand" : "border border-line bg-white font-medium text-ink",
                )}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(kind)} className="absolute m-0 size-px opacity-0" />
                {on && <Icon name="check" size={14} strokeWidth={2.6} />}
                {kind}
              </label>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sp-opening" className="text-[15px] font-semibold">
          {t("opening")} <span className="font-normal text-ink-3">{t("optional")}</span>
        </label>
        <MoneyInput
          id="sp-opening"
          placeholder="0"
          value={opening}
          onChange={setOpening}
          aria-describedby="sp-opening-help"
          wrapperClassName="w-full sm:w-65"
        />
        <p id="sp-opening-help" className="m-0 text-[13px] text-ink-3">
          {t("openingHelp")}
        </p>
      </div>
      <LabeledInput
        id="sp-note"
        label={t("note")}
        labelNote={t("optional")}
        maxLength={500}
        placeholder={t("notePlaceholder")}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </FormDialog>
  );
}
