"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { TextInput } from "@/components/shared/form/TextInput";
import { Segmented } from "@/components/shared/Segmented";
import { Icon } from "@/components/shared/icon/Icon";
import { displayPhone, normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { ICustomer } from "@/types/sales.types";
import type { SaleDraft, SaleErrors } from "./saleDraft";

type SaleBuyerFieldsProps = { draft: SaleDraft; customers: ICustomer[]; errors: SaleErrors; onChange: (patch: Partial<SaleDraft>) => void };

const boughtOf = (c: ICustomer) => c.sales.map((s) => s.unitName).join(", ");

// "২. ক্রেতা" (board SaleNew): a new buyer's details, or one picked from earlier customers.
export function SaleBuyerFields({ draft, customers, errors, onChange }: SaleBuyerFieldsProps) {
  const t = useTranslations("SaleNew");
  const [q, setQ] = useState("");
  const setCustomer = (patch: Partial<SaleDraft["customer"]>) => onChange({ customer: { ...draft.customer, ...patch } });
  const typed = normalizePhone(draft.customer.phone);
  const match = typed ? customers.find((c) => c.phone === typed) : undefined;
  const squash = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();
  const shown = customers.filter((c) => !q || squash(c.name).includes(squash(q)) || c.phone.includes(squash(q)));

  return (
    <section aria-labelledby="s-cust-title" className="flex flex-col gap-3.5 px-5 py-5.5 lg:px-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="s-cust-title" className="m-0 text-[17px] font-semibold">
          {t("custTitle")} <span className="text-danger">*</span>
        </h2>
        <Segmented
          label={t("custModes")}
          value={draft.mode}
          onChange={(mode) => onChange({ mode })}
          options={[
            { value: "NEW", label: t("custNew") },
            { value: "OLD", label: t("custOld") },
          ]}
        />
      </div>
      {draft.mode === "NEW" ? (
        <>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <Field id="c-name" label={t("name")} required error={errors.name && t("nameError")}>
              <TextInput
                id="c-name"
                maxLength={60}
                placeholder={t("namePh")}
                value={draft.customer.name}
                onChange={(e) => setCustomer({ name: e.target.value })}
                invalid={!!errors.name}
              />
            </Field>
            <Field id="c-phone" label={t("phone")} required error={errors.phone && t("phoneError")}>
              <TextInput
                id="c-phone"
                type="tel"
                placeholder="01XXX-XXXXXX"
                value={draft.customer.phone}
                onChange={(e) => setCustomer({ phone: e.target.value })}
                invalid={!!errors.phone}
              />
            </Field>
            <Field id="c-nid" label={t("nid")} note={t("optional")}>
              <TextInput
                id="c-nid"
                inputMode="numeric"
                maxLength={17}
                placeholder={t("nidPh")}
                value={draft.customer.nid}
                onChange={(e) => setCustomer({ nid: e.target.value.replace(/\D/g, "") })}
              />
            </Field>
            <Field id="c-addr" label={t("address")} note={t("optional")}>
              <TextInput
                id="c-addr"
                maxLength={200}
                placeholder={t("addressPh")}
                value={draft.customer.address}
                onChange={(e) => setCustomer({ address: e.target.value })}
              />
            </Field>
          </div>
          {match && (
            <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-gold-line bg-gold-wash px-3.5 py-2.5 text-sm text-gold-deep">
              <span className="grow">{t("match", { name: `${match.name} (${boughtOf(match)})` })}</span>
              <button
                type="button"
                onClick={() => onChange({ mode: "OLD", customerId: match.id })}
                className="h-8.5 cursor-pointer rounded-lg border border-gold-ink bg-white px-3 text-[13px] font-semibold whitespace-nowrap text-gold-deep"
              >
                {t("useMatch")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2.5">
          <label className="relative flex items-center">
            <span className="sr-only">{t("custSearch")}</span>
            <Icon name="search" size={18} strokeWidth={2} className="pointer-events-none absolute left-3 text-ink-3" />
            <input
              type="search"
              placeholder={t("custSearch")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-line bg-white pr-3 pl-9.5 text-[15px] text-ink outline-none"
            />
          </label>
          <div role="radiogroup" aria-label={t("custList")} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {shown.map((c) => {
              const on = c.id === draft.customerId;
              return (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[10px]",
                    on ? "border-2 border-brand bg-brand-wash px-2.75 py-2.25" : "border border-line bg-white px-3 py-2.5",
                  )}
                >
                  <input
                    type="radio"
                    name="old-cust"
                    checked={on}
                    onChange={() => onChange({ customerId: c.id })}
                    className="m-0 size-4.5 shrink-0 accent-brand"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[15px] font-semibold">{c.name}</span>
                    <span className="text-xs text-ink-3">{t("custBought", { phone: displayPhone(c.phone), units: boughtOf(c) || "—" })}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {!customers.length && <span className="text-sm text-ink-3">{t("noCustomers")}</span>}
          {errors.customer && <span className="text-[13px] text-danger">{t("custPick")}</span>}
        </div>
      )}
    </section>
  );
}

function Field({
  id,
  label,
  note,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  note?: string;
  required?: boolean;
  error?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label} {required && <span className="text-danger">*</span>}
        {note && <span className="font-normal text-ink-3">{note}</span>}
      </label>
      {children}
      {error && <span className="text-[13px] text-danger">{error}</span>}
    </div>
  );
}
