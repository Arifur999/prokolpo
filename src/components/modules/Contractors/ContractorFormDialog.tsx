"use client";

import { useRouter } from "next/navigation";
import { useMessages, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createContractorAction } from "@/app/(dashboardLayout)/projects/[projectId]/contractors/_action";
import { FieldMessage } from "@/components/shared/form/FieldMessage";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Stepper } from "@/components/shared/form/Stepper";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { PayType } from "@/types/books.types";

type ContractorFormDialogProps = {
  projectId: string;
  onClose: () => void;
  onAdded?: (id: string) => void;
};

const MAX_TEAM = 50;

// "নতুন কন্ট্রাক্টর বা মিস্ত্রি": a contract with an agreed price, or a daily-wage team
// (board ContractorAdd).
export function ContractorFormDialog({ projectId, onClose, onAdded }: ContractorFormDialogProps) {
  const t = useTranslations("Contractors.form");
  const works = useMessages().Lists.works;
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [work, setWork] = useState(works[0] ?? "");
  const [payType, setPayType] = useState<PayType>("CONTRACT");
  const [amount, setAmount] = useState("");
  const [scope, setScope] = useState("");
  const [wage, setWage] = useState("");
  const [team, setTeam] = useState(1);
  const [opening, setOpening] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const errors = {
    name: serverErrors.name ?? (submitted && !name.trim() ? t("validation.name") : undefined),
    amount: submitted && payType === "CONTRACT" && !Number(amount) ? t("validation.amount") : undefined,
    wage: submitted && payType === "DAILY" && !Number(wage) ? t("validation.wage") : undefined,
  };

  const save = () => {
    setSubmitted(true);
    if (!name.trim() || (payType === "CONTRACT" ? !Number(amount) : !Number(wage))) return;
    startTransition(async () => {
      const result = await createContractorAction(projectId, {
        name: name.trim(),
        phone: phone.trim(),
        work,
        payType,
        contractAmount: Number(amount || 0),
        scope: scope.trim(),
        dailyWage: Number(wage || 0),
        teamSize: team,
        openingDue: Number(opening || 0),
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

  const option = (value: PayType, title: string, body: string) => {
    const on = payType === value;
    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-[14px]",
          on ? "border-2 border-brand bg-brand-wash p-3.25" : "border border-line bg-white p-3.5",
        )}
      >
        <input type="radio" name="ct-pay" checked={on} onChange={() => setPayType(value)} className="m-0 mt-0.75 size-4.5 shrink-0 accent-brand" />
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">{title}</span>
          <span className="text-[13px] leading-normal text-ink-2">{body}</span>
        </span>
      </label>
    );
  };

  return (
    <FormDialog
      title={t("title")}
      subtitle={t("subtitle")}
      closeLabel={t("close")}
      onClose={onClose}
      topClass="top-12"
      footer={<DialogButtons cancel={t("cancel")} submit={t("submit")} onCancel={onClose} onSubmit={save} pending={isPending} />}
    >
      <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-[minmax(0,1fr)_200px]">
        <LabeledInput
          id="ct-name"
          autoFocus
          aria-required="true"
          maxLength={80}
          label={
            <>
              {t("name")} <span className="text-danger">*</span>
            </>
          }
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setServerErrors({});
          }}
          error={errors.name}
        />
        <LabeledInput
          id="ct-phone"
          type="tel"
          label={t("phone")}
          labelNote={t("optional")}
          placeholder="01XXXXXXXXX"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      <div role="radiogroup" aria-labelledby="ct-work-title" className="flex flex-col gap-2">
        <span id="ct-work-title" className="text-[15px] font-semibold">
          {t("work")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {works.map((kind) => {
            const on = kind === work;
            return (
              <label
                key={kind}
                className={cn(
                  "relative box-border flex h-8.5 cursor-pointer items-center gap-1.25 rounded-full px-3 text-sm has-focus-visible:shadow-focus",
                  on ? "border-[1.5px] border-brand bg-brand-wash font-semibold text-brand" : "border border-line bg-white font-medium text-ink",
                )}
              >
                <input type="radio" name="ct-work" checked={on} onChange={() => setWork(kind)} className="absolute m-0 size-px opacity-0" />
                {on && <Icon name="check" size={14} strokeWidth={2.6} />}
                {kind}
              </label>
            );
          })}
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="ct-pay-title" className="flex flex-col gap-2">
        <span id="ct-pay-title" className="text-[15px] font-semibold">
          {t("payType")}
        </span>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {option("CONTRACT", t("contractTitle"), t("contractBody"))}
          {option("DAILY", t("dailyTitle"), t("dailyBody"))}
        </div>
      </div>

      {payType === "CONTRACT" ? (
        <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ct-amount" className="text-[15px] font-semibold">
              {t("amount")} <span className="text-danger">*</span>
            </label>
            <MoneyInput
              id="ct-amount"
              aria-required="true"
              invalid={Boolean(errors.amount)}
              placeholder={t("amountPlaceholder")}
              value={amount}
              onChange={setAmount}
            />
            {errors.amount && (
              <FieldMessage id="ct-amount-msg" tone="error">
                {errors.amount}
              </FieldMessage>
            )}
          </div>
          <LabeledInput
            id="ct-scope"
            label={t("scope")}
            labelNote={t("optional")}
            maxLength={120}
            placeholder={t("scopePlaceholder")}
            value={scope}
            onChange={(event) => setScope(event.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 items-start gap-3.5 sm:grid-cols-[220px_200px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ct-wage" className="text-[15px] font-semibold">
                {t("wage")} <span className="text-danger">*</span>
              </label>
              <MoneyInput id="ct-wage" aria-required="true" invalid={Boolean(errors.wage)} placeholder={t("wagePlaceholder")} value={wage} onChange={setWage} />
              {errors.wage && (
                <FieldMessage id="ct-wage-msg" tone="error">
                  {errors.wage}
                </FieldMessage>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ct-team" className="text-[15px] font-semibold">
                {t("team")}
              </label>
              <Stepper id="ct-team" value={team} max={MAX_TEAM} onChange={(n) => setTeam(Math.max(1, n))} lessLabel={t("teamLess")} moreLabel={t("teamMore")} />
            </div>
          </div>
          <p className="m-0 rounded-lg bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
            {Number(wage) ? t("dailyPreview", { count: team, amount: formatAmount(team * Number(wage)) }) : t("dailyPreviewEmpty")}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ct-opening" className="text-[15px] font-semibold">
          {t("opening")} <span className="font-normal text-ink-3">{t("optional")}</span>
        </label>
        <MoneyInput id="ct-opening" placeholder="0" value={opening} onChange={setOpening} wrapperClassName="w-full sm:w-65" />
      </div>
    </FormDialog>
  );
}
