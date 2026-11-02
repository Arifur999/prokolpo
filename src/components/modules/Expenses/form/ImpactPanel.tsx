"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { dayFirst } from "@/lib/expenseText";
import { budgetTone, formatAmount, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Party, PhaseOption } from "./PartyFields";
import type { AccountOption } from "./PaymentFields";
import { amountOf, partyIdOf, type ExpenseValues } from "./expenseValues";

// The bill as saved, when editing: its old amount comes out of every total it is in.
export type OriginalBill = { amount: number; partyId: string; phaseId: string; categoryName: string; paidNow: boolean; paidOnBill: number };

export type Change = { label: string; before: string; after: string };

type ImpactPanelProps = {
  values: ExpenseValues;
  original?: OriginalBill;
  changes?: Change[];
  party: Party | null;
  account: AccountOption | null;
  phase: PhaseOption | null;
  categoryName: string;
  categoryTotal: number;
};

const BAR = { ok: "bg-brand-mid", near: "bg-gold-strong", over: "bg-danger-strong" };
const INK = { ok: "text-ink", near: "text-gold-ink", over: "text-danger" };

function Row({ icon, title, aside, children, last }: { icon: IconName; title: string; aside?: ReactNode; children?: ReactNode; last?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-2 py-4", !last && "border-b border-line-3")}>
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-surface-4 text-ink-2">
          <Icon name={icon} size={16} />
        </span>
        <span className="text-[15px] font-semibold">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Move({ before, after, afterClass }: { before: string; after: string; afterClass?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[15px]">
      <span className="text-ink-3">{before}</span>
      <Icon name="arrowRight" size={16} strokeWidth={2} className="text-ink-3" />
      <strong className={cn("font-bold", afterClass)}>{after}</strong>
    </div>
  );
}

function Changes({ changes }: { changes: Change[] }) {
  const t = useTranslations("ExpenseForm.impact");
  return (
    <div className="flex flex-col gap-2 border-b border-line-3 bg-surface-3 px-6 py-4">
      <span className="text-sm font-bold">{t("changesTitle")}</span>
      {changes.length === 0 && <span className="text-[13px] text-ink-3">{t("noChanges")}</span>}
      {changes.map((change) => (
        <div key={change.label} className="flex flex-col gap-px rounded-md border border-line-3 bg-white px-2.5 py-1.5">
          <span className="text-xs font-semibold text-ink-3">{change.label}</span>
          <span className="flex flex-wrap items-baseline gap-1.5 text-sm">
            {change.before && <span className="text-ink-5 line-through">{change.before}</span>}
            <span aria-hidden="true" className="text-ink-3">
              →
            </span>
            <strong className="font-bold">{change.after || "—"}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

// "সেভ করলে যা হবে": where the party's due, the account, the phase and the head will stand
// once the bill is saved (board ExpenseNew); when editing, with the old bill taken out
// first and the changed fields listed (board ExpenseEdit).
export function ImpactPanel({ values, original, changes, party, account, phase, categoryName, categoryTotal }: ImpactPanelProps) {
  const t = useTranslations("ExpenseForm.impact");
  const amount = amountOf(values);
  const taka = (n: number) => `৳ ${formatAmount(n)}`;
  const signed = (n: number) => (n < 0 ? t("minus", { amount: formatAmount(-n) }) : taka(n));
  // What the old bill contributed to a total it was part of.
  const was = (inIt: boolean | undefined) => (original && inIt ? original.amount : 0);

  const paidNow = original ? original.paidNow : values.paidNow;
  const hasParty = Boolean(party && partyIdOf(values));
  const partyAfter = party ? party.due + (paidNow ? 0 : amount) - was(original?.partyId === party.id && !original.paidNow) : 0;
  // A bill paid on the spot keeps its payment equal to the bill, so the account moves by the difference.
  const accountMove = original ? (original.paidNow ? amount - original.amount : 0) : amount;
  const accountAfter = account ? account.balance - accountMove : 0;
  const phaseAfter = phase ? phase.spent + amount - was(original?.phaseId === phase.id) : 0;
  const percent = phase?.budget ? (phaseAfter / phase.budget) * 100 : null;
  const tone = percent === null ? "ok" : budgetTone(percent);

  const accountTitle = paidNow && account ? t("fromAccount", { account: account.name }) : original ? t("noAccountChange") : t("noAccount");
  const accountNote = original
    ? original.paidNow
      ? t("withPayment")
      : t("keptPayment", { amount: formatAmount(original.paidOnBill) })
    : paidNow
      ? t("withPayment")
      : t("onCredit");

  return (
    <aside aria-labelledby="ex-impact-title" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white lg:sticky lg:top-6">
      <div className="flex flex-col gap-1 bg-brand px-6 py-5 text-white">
        <span id="ex-impact-title" className="text-[13px] font-semibold text-white/72">
          {original ? t("editTitle") : t("title")}
        </span>
        <span className="text-[30px] leading-tight font-bold">{taka(amount)}</span>
        <span className="text-sm text-white/80">{[categoryName, phase?.name, dayFirst(values.date)].filter(Boolean).join(" · ")}</span>
      </div>

      {changes && <Changes changes={changes} />}

      <div className="flex flex-col px-6 pt-1 pb-2">
        <Row icon="user" title={hasParty && party ? t("partyDue", { party: party.name }) : t("noParty")}>
          {hasParty && party && <Move before={taka(party.due)} after={taka(partyAfter)} afterClass={partyAfter > party.due ? "text-gold-ink" : undefined} />}
          <span className="text-[13px] text-ink-3">{!hasParty ? t("noPartyNote") : paidNow ? t("paidNowNote") : t("payLater")}</span>
        </Row>

        <Row icon="wallet" title={accountTitle}>
          {paidNow && account && accountMove !== 0 && (
            <Move before={taka(account.balance)} after={signed(accountAfter)} afterClass={accountAfter < 0 ? "text-danger" : undefined} />
          )}
          {paidNow && accountAfter < 0 && accountMove > 0 && (
            <p className="m-0 flex items-start gap-1.5 rounded-md bg-danger-tint px-2.5 py-2 text-[13px] font-semibold text-danger">
              <Icon name="alertTriangle" size={15} strokeWidth={2} className="mt-0.5" />
              {t("short")}
            </p>
          )}
          <span className="text-[13px] text-ink-3">{accountNote}</span>
        </Row>

        {phase && (
          <Row
            icon="activity"
            title={t("phase", { phase: phase.name })}
            aside={percent !== null && <span className={cn("ml-auto text-sm font-bold", INK[tone])}>{formatPercent(percent)}</span>}
          >
            <Move before={taka(phase.spent)} after={taka(phaseAfter)} />
            {percent !== null && phase.budget && (
              <div
                role="img"
                aria-label={t("phaseAria", { phase: phase.name, percent: formatPercent(percent) })}
                className="relative h-2 overflow-hidden rounded-full bg-line-3"
              >
                <div className={cn("absolute inset-y-0 left-0 rounded-full opacity-35", BAR[tone])} style={{ width: `${Math.min(100, percent)}%` }} />
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full", BAR[tone])}
                  style={{ width: `${Math.min(100, (phase.spent / phase.budget) * 100)}%` }}
                />
              </div>
            )}
            <span className="text-[13px] text-ink-3">
              {phase.budget
                ? t("phaseBudget", { amount: formatAmount(phase.budget) }) + (tone === "over" ? t("phaseOver") : tone === "near" ? t("phaseNear") : "")
                : t("phaseNoBudget")}
            </span>
          </Row>
        )}

        {categoryName && (
          <Row icon="tag" title={t("category", { category: categoryName })} last>
            <Move before={taka(categoryTotal)} after={taka(categoryTotal + amount - was(original?.categoryName === categoryName))} />
          </Row>
        )}
      </div>

      <p className="m-0 flex items-start gap-2 border-t border-line-3 bg-surface-2 px-6 py-3.5 text-[13px] leading-[1.55] text-ink-2">
        <Icon name="info" size={16} strokeWidth={2} className="mt-0.5" />
        {t("footnote")}
      </p>
    </aside>
  );
}
