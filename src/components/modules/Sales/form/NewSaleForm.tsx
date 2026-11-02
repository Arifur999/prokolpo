"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createSaleAction } from "@/app/(dashboardLayout)/projects/[projectId]/sales/_action";
import { AccountPicker, type PickableAccount } from "@/components/shared/form/AccountPicker";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { projectHref, saleReceiptHref } from "@/lib/routes";
import { floorShort } from "@/lib/unitLook";
import { cn } from "@/lib/utils";
import type { ICustomer, IUnit } from "@/types/sales.types";
import { SaleBuyerFields } from "./SaleBuyerFields";
import { SaleImpact } from "./SaleImpact";
import { SalePriceFields } from "./SalePriceFields";
import { blankSale, saleErrors, salePayload, type SaleDraft } from "./saleDraft";

type NewSaleFormProps = {
  projectId: string;
  units: IUnit[];
  customers: ICustomer[];
  accounts: PickableAccount[];
  today: string;
  unitId: string;
  owedNow: number;
};

// "নতুন বিক্রি" (board SaleNew): the unit, the buyer, the price and installments, where the
// money went — and beside it, what saving will do.
export function NewSaleForm({ projectId, units, customers, accounts, today, unitId, owedNow }: NewSaleFormProps) {
  const t = useTranslations("SaleNew");
  const tu = useTranslations("Units");
  const locale = useLocale() as "bn" | "en";
  const router = useRouter();
  const first = units.find((u) => u.id === unitId) ?? units[0];
  const [draft, setDraft] = useState<SaleDraft>(blankSale(today, first?.id ?? "", first?.price ?? 0, accounts[0]?.id ?? ""));
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const change = (patch: Partial<SaleDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const unit = units.find((u) => u.id === draft.unitId);
  const all = saleErrors(draft, today);
  const errors = submitted ? all : {};
  const errorCount = Object.keys(all).length;
  const kist = draft.plan === "KIST";
  const down = kist ? Number(draft.down || 0) : Number(draft.price || 0);
  const picked = customers.find((c) => c.id === draft.customerId);
  const buyer =
    draft.mode === "NEW" ? t("newCust", { name: draft.customer.name.trim() || t("newBuyer") }) : picked ? t("oldCust", { name: picked.name }) : t("noBuyer");
  const buyerNote = draft.mode === "NEW" ? t("newCustNote") : picked ? t("oldCustNote", { units: picked.sales.map((s) => s.unitName).join(", ") || "—" }) : "";

  const save = () => {
    setSubmitted(true);
    if (errorCount) return;
    startTransition(async () => {
      const result = await createSaleAction(projectId, salePayload(draft));
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { unit: unit?.name ?? "", name: draft.mode === "NEW" ? draft.customer.name.trim() : (picked?.name ?? "") }));
      if (draft.print && result.data.paymentId) router.push(saleReceiptHref(projectId, result.data.paymentId));
      else router.push(projectHref(projectId, `sales/${result.data.saleId}`));
    });
  };

  if (!units.length) return <p className="m-0 rounded-2xl border border-line-2 bg-white p-6 text-[15px] text-ink-2">{t("noUnits")}</p>;

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <form noValidate onSubmit={(e) => e.preventDefault()} className="flex flex-col rounded-2xl border border-line-2 bg-white">
        <section aria-labelledby="s-unit-title" className="flex flex-col gap-3 px-5 py-5.5 lg:px-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="s-unit-title" className="m-0 text-[17px] font-semibold">
              {t("unitTitle")} <span className="text-danger">*</span>
            </h2>
            <span className="text-[13px] text-ink-3">{t("unitNote")}</span>
          </div>
          <div role="radiogroup" aria-labelledby="s-unit-title" className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {units.map((u) => {
              const on = u.id === draft.unitId;
              return (
                <button
                  key={u.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => change({ unitId: u.id, price: String(u.price) })}
                  className={cn(
                    "flex cursor-pointer flex-col items-start rounded-[10px] px-3 py-2 text-left text-ink",
                    on ? "border-2 border-brand bg-brand-wash" : "border border-line bg-white",
                  )}
                >
                  <span className={cn("text-[15px]", on ? "font-bold" : "font-medium")}>{u.name}</span>
                  <span className="text-xs text-ink-3">৳ {formatAmount(u.price)}</span>
                </button>
              );
            })}
          </div>
          {unit && (
            <p className="m-0 flex flex-wrap items-center gap-2 rounded-[10px] bg-surface-2 px-3 py-2.5 text-sm text-ink-2">
              <Icon name="info" size={16} strokeWidth={2} />
              <strong className="font-semibold text-ink">{unit.name}</strong>
              {t("unitInfo", {
                floor: floorShort(locale, unit.floor),
                type: tu(`type.${unit.type}`),
                size: unit.size ? ` · ${unit.size} sqft` : "",
                price: formatAmount(unit.price),
              })}
            </p>
          )}
        </section>
        <div className="mx-5 h-px bg-line-3 lg:mx-7" />
        <SaleBuyerFields draft={draft} customers={customers} errors={errors} onChange={change} />
        <div className="mx-5 h-px bg-line-3 lg:mx-7" />
        <SalePriceFields draft={draft} listPrice={unit?.price ?? 0} errors={errors} onChange={change} />
        <div className="mx-5 h-px bg-line-3 lg:mx-7" />
        <section aria-labelledby="s-acc-title" className="flex flex-col gap-3 px-5 py-5.5 lg:px-7">
          {down > 0 ? (
            <AccountPicker
              name="s-acc"
              label={kist ? t("accKist") : t("accFull")}
              accounts={accounts}
              value={draft.accountId}
              onChange={(accountId) => change({ accountId })}
            />
          ) : (
            <>
              <h2 id="s-acc-title" className="m-0 text-[17px] font-semibold">
                {t("accKist")}
              </h2>
              <p className="m-0 text-sm text-ink-3">{t("noAcc")}</p>
            </>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.print} onChange={(e) => change({ print: e.target.checked })} className="m-0 size-4.5 accent-brand" />
            {kist ? t("printKist") : t("printFull")}
          </label>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line-2 bg-surface-3 px-5 py-4.5 lg:px-7">
          <span className={cn("text-sm", submitted && errorCount ? "text-danger" : "text-ink-3")}>
            {submitted && errorCount ? t("fix", { count: errorCount }) : t("footNote")}
          </span>
          <div className="flex gap-3">
            <Link
              href={projectHref(projectId, "sales")}
              className="flex h-12 items-center rounded-xl border border-line bg-white px-4.5 text-[15px] font-semibold text-ink no-underline"
            >
              {t("cancel")}
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              aria-busy={isPending}
              className="h-12 cursor-pointer rounded-xl border-none bg-brand px-5.5 text-[15px] font-semibold text-white"
            >
              {t("save")}
            </button>
          </div>
        </div>
      </form>
      <SaleImpact
        draft={draft}
        unitName={unit?.name ?? ""}
        buyer={buyer}
        buyerNote={buyerNote}
        account={accounts.find((a) => a.id === draft.accountId)}
        owedNow={owedNow}
      />
    </div>
  );
}
