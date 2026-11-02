"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addCustomerAction } from "@/app/(dashboardLayout)/projects/[projectId]/customers/_action";
import { TextInput } from "@/components/shared/form/TextInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { normalizePhone } from "@/lib/phone";
import { projectHref } from "@/lib/routes";
import type { ICustomer } from "@/types/sales.types";

type CustomerDialogProps = { projectId: string; customers: ICustomer[]; onClose: () => void };

// "নতুন কাস্টমার" (board CustomerAdd): someone to sell to later, picked from "আগের কাস্টমার".
export function CustomerDialog({ projectId, customers, onClose }: CustomerDialogProps) {
  const t = useTranslations("Customers.dialog");
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", altPhone: "", nid: "", address: "", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const phone = normalizePhone(form.phone);
  const dup = phone ? customers.find((c) => c.phone === phone) : undefined;
  const nameBad = submitted && form.name.trim().length < 2;
  const phoneBad = submitted && !phone;
  const altBad = submitted && !!form.altPhone.trim() && !normalizePhone(form.altPhone);

  const save = () => {
    setSubmitted(true);
    if (form.name.trim().length < 2 || !phone || dup || (form.altPhone.trim() && !normalizePhone(form.altPhone))) return;
    startTransition(async () => {
      const result = await addCustomerAction(projectId, { ...form, name: form.name.trim(), phone, altPhone: normalizePhone(form.altPhone) ?? "" });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { name: result.data.name }));
      onClose();
      router.refresh();
    });
  };

  const label = (id: string, text: string, required = false) => (
    <label htmlFor={id} className="text-[15px] font-semibold">
      {text} {required ? <span className="text-danger">*</span> : <span className="font-normal text-ink-3">{t("optional")}</span>}
    </label>
  );

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle")}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass="max-w-160"
      topClass="top-14"
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          {label("cu-name", t("name"), true)}
          <TextInput
            id="cu-name"
            autoFocus
            maxLength={60}
            placeholder={t("namePh")}
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            invalid={nameBad}
          />
          {nameBad && <span className="text-[13px] text-danger">{t("nameError")}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          {label("cu-phone", t("phone"), true)}
          <TextInput
            id="cu-phone"
            type="tel"
            placeholder="01XXX-XXXXXX"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            invalid={phoneBad}
          />
          {phoneBad && <span className="text-[13px] text-danger">{t("phoneError")}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          {label("cu-alt", t("alt"))}
          <TextInput
            id="cu-alt"
            type="tel"
            placeholder={t("altPh")}
            value={form.altPhone}
            onChange={(e) => set({ altPhone: e.target.value })}
            invalid={altBad}
          />
          {altBad && <span className="text-[13px] text-danger">{t("phoneError")}</span>}
        </div>
        {dup && (
          <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-gold-line bg-gold-wash px-3.5 py-2.5 text-sm text-gold-deep sm:col-span-2">
            <Icon name="alertTriangle" size={16} strokeWidth={2} />
            <span className="grow">{t("dup", { name: dup.name })}</span>
            <Link href={projectHref(projectId, `customers/${dup.id}`)} className="text-[13px] font-semibold whitespace-nowrap">
              {t("dupLink")}
            </Link>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {label("cu-nid", t("nid"))}
          <TextInput
            id="cu-nid"
            inputMode="numeric"
            maxLength={17}
            placeholder={t("nidPh")}
            value={form.nid}
            onChange={(e) => set({ nid: e.target.value.replace(/\D/g, "") })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          {label("cu-addr", t("address"))}
          <TextInput id="cu-addr" maxLength={200} placeholder={t("addressPh")} value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          {label("cu-note", t("note"))}
          <textarea
            id="cu-note"
            rows={2}
            maxLength={300}
            placeholder={t("notePh")}
            value={form.note}
            onChange={(e) => set({ note: e.target.value })}
            className="resize-none rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-[15px] leading-normal text-ink outline-none focus:border-brand"
          />
        </div>
      </div>
    </FormDialog>
  );
}
