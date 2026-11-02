"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { ProjectPageHeader } from "../Project/ProjectPageHeader";
import { Segmented } from "@/components/shared/Segmented";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount, formatPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { IAccount, IMovement } from "@/types/books.types";
import { AccountFormDialog } from "./AccountFormDialog";
import { ACCOUNT_ICON, accountLook } from "./accountLook";
import { TransferDialog } from "./TransferDialog";

type AccountsViewProps = {
  projectId: string;
  accounts: IAccount[];
  movements: IMovement[];
  today: string;
  canWrite: boolean;
  projectName: string;
};

type Direction = "all" | "in" | "out";

const GRID = "lg:grid-cols-[104px_minmax(0,1fr)_136px_168px_124px_124px_136px]";
const KIND_PILL: Record<IMovement["kind"], string> = {
  OPENING: "bg-brand-tint text-success",
  PAYMENT: "bg-surface-4 text-ink-2",
  BUY: "bg-gold-tint text-gold-ink",
  DEPOSIT: "bg-brand-tint text-success",
  COLLECTION: "bg-brand-tint text-success",
  TRANSFER_IN: "bg-info-tint text-info",
  TRANSFER_OUT: "bg-info-tint text-info",
};
const signed = (n: number) => (n < 0 ? `−${formatAmount(-n)}` : formatAmount(n));

// Board Accounts: the money on hand, one card per account (a click filters the ledger to it),
// and every movement with that account's balance after it.
export function AccountsView({ projectId, accounts, movements, today, canWrite, projectName }: AccountsViewProps) {
  const t = useTranslations("Accounts");
  const [selected, setSelected] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("all");
  const [dialog, setDialog] = useState<"transfer" | "add" | null>(null);
  const index = new Map(accounts.map((a, i) => [a.id, i]));
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const positive = accounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);
  const selectedAccount = accounts.find((a) => a.id === selected);

  const rows = movements.filter((m) => (!selected || m.accountId === selected) && (direction === "all" || (direction === "in" ? m.amount > 0 : m.amount < 0)));
  const footIn = rows.reduce((sum, m) => sum + Math.max(0, m.amount), 0);
  const footOut = rows.reduce((sum, m) => sum + Math.max(0, -m.amount), 0);

  const describe = (m: IMovement) => {
    switch (m.kind) {
      case "OPENING":
        return { title: t("openingTitle"), sub: "" };
      case "TRANSFER_OUT":
        return { title: t("transferOut", { other: m.otherAccount ?? "" }), sub: m.note ?? "" };
      case "TRANSFER_IN":
        return { title: t("transferIn", { other: m.otherAccount ?? "" }), sub: m.note ?? "" };
      case "BUY":
        return { title: t("buyTitle", { title: m.title ?? "" }), sub: m.note ?? "" };
      case "COLLECTION":
        return { title: t("collectionFrom", { party: m.party ?? "" }), sub: [m.title, m.note].filter(Boolean).join(" · ") };
      case "DEPOSIT":
        return { title: t("depositFrom", { party: m.party ?? "" }), sub: m.note ?? "" };
      default:
        return {
          title: m.party ? t("paymentTo", { party: m.party }) : (m.title ?? t("moves.PAYMENT")),
          sub: [m.title && m.party ? m.title : null, m.note].filter(Boolean).join(" · "),
        };
    }
  };

  return (
    <>
      <ProjectPageHeader
        projectName={projectName}
        title={t("title")}
        actions={
          canWrite && (
            <>
              {accounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDialog("transfer")}
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-brand bg-white px-4 text-[15px] font-semibold text-brand"
                >
                  <Icon name="refresh" size={18} />
                  {t("transfer")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setDialog("add")}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border-none bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white"
              >
                <Icon name="plus" size={18} strokeWidth={2.2} />
                {t("add")}
              </button>
            </>
          )
        }
      />

      <section
        aria-label={t("totalLabel")}
        className="flex flex-col gap-5 rounded-2xl border border-line-2 bg-white px-7 py-5.5 lg:flex-row lg:items-center lg:gap-10"
      >
        <div className="flex shrink-0 flex-col gap-0.5">
          <h2 className="m-0 text-[15px] font-medium text-ink-2">{t("totalLabel")}</h2>
          <p className={cn("m-0 text-[34px] leading-[1.2] font-bold", total < 0 && "text-danger")}>৳ {signed(total)}</p>
          <p className="m-0 text-[13px] text-ink-3">{t("totalSub", { count: accounts.length, date: dayFirst(today) })}</p>
        </div>
        <figure aria-label={t("shareLabel")} className="m-0 flex grow flex-col gap-3">
          <div className="flex h-4 gap-0.5 overflow-hidden rounded-md bg-line-3">
            {accounts.map((a, i) => (
              <span
                key={a.id}
                title={a.name}
                className={cn("h-full", accountLook(i).color)}
                style={{ width: `${positive ? (Math.max(0, a.balance) / positive) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {accounts.map((a, i) => (
              <span key={a.id} className="flex items-center gap-2 text-sm">
                <span aria-hidden="true" className={cn("size-2.5 rounded-[3px]", accountLook(i).color)} />
                <span className="text-ink-2">{a.name}</span>
                <strong className="font-semibold">৳ {signed(a.balance)}</strong>
                <span className="text-ink-3">{formatPercent(positive ? (Math.max(0, a.balance) / positive) * 100 : 0)}</span>
              </span>
            ))}
          </div>
        </figure>
      </section>

      <section aria-label={t("cardsLabel")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {accounts.map((a, i) => {
          const on = a.id === selected;
          const look = accountLook(i);
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSelected(on ? null : a.id)}
              className={cn(
                "flex cursor-pointer flex-col items-stretch gap-2.5 rounded-2xl text-left text-ink",
                on ? "border-2 border-brand bg-brand-wash p-4.25" : "border border-line-2 bg-white p-4.5 hover:border-line",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", look.tint, look.text)}>
                  <Icon name={ACCOUNT_ICON[a.kind]} size={20} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{a.name}</span>
                  <span className="truncate text-[13px] text-ink-3">{[t(`kind${a.kind}`), a.number].filter(Boolean).join(" · ")}</span>
                </span>
              </span>
              <span className={cn("text-2xl leading-[1.2] font-bold", a.balance < 0 && "text-danger")}>৳ {signed(a.balance)}</span>
              <span className="truncate text-[13px] text-ink-3">
                {a.lastDate && a.lastMove !== null
                  ? t("last", {
                      date: dayFirst(a.lastDate.slice(0, 10)).slice(0, 5),
                      amount: `${a.lastMove > 0 ? "+" : "−"} ৳ ${formatAmount(Math.abs(a.lastMove))}`,
                    })
                  : t("noMoves")}
              </span>
            </button>
          );
        })}
        {canWrite && (
          <button
            type="button"
            onClick={() => setDialog("add")}
            className="flex min-h-37.5 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line-strong bg-transparent p-4 text-ink"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-tint text-brand">
              <Icon name="plus" size={22} strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-semibold">{t("newCard")}</span>
            <span className="text-[13px] text-ink-3">{t("newCardSub")}</span>
          </button>
        )}
      </section>

      <section aria-label={t("listLabel")} className="flex grow flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line-2 px-5 py-4">
          <div className="mr-auto flex flex-col">
            <h2 className="m-0 text-[17px] leading-[1.4] font-semibold">
              {selectedAccount ? t("accountTitle", { name: selectedAccount.name }) : t("allTitle")}
            </h2>
            <p className="m-0 text-[13px] text-ink-3">{selectedAccount ? t("accountSub") : t("allSub")}</p>
          </div>
          {selectedAccount && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium text-ink"
            >
              {t("showAll")}
              <Icon name="x" size={14} strokeWidth={2} />
            </button>
          )}
          <Segmented
            label={t("dirLabel")}
            value={direction}
            onChange={setDirection}
            options={[
              { value: "all", label: t("dirAll") },
              { value: "in", label: t("dirIn") },
              { value: "out", label: t("dirOut") },
            ]}
          />
        </div>

        <div role="table" aria-label={t("listLabel")} className="flex grow flex-col">
          <div
            role="row"
            className={cn("hidden h-11 items-center border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2 lg:grid", GRID)}
          >
            <span role="columnheader">{t("date")}</span>
            <span role="columnheader">{t("description")}</span>
            <span role="columnheader">{t("kind")}</span>
            <span role="columnheader">{t("account")}</span>
            <span role="columnheader" className="pr-3 text-right">
              {t("in")}
            </span>
            <span role="columnheader" className="pr-3 text-right">
              {t("out")}
            </span>
            <span role="columnheader" className="text-right">
              {t("balance")}
            </span>
          </div>
          {rows.map((m) => {
            const { title, sub } = describe(m);
            return (
              <div
                key={`${m.ref}-${m.accountId}`}
                role="row"
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-line-3 px-4 py-3 text-sm lg:min-h-14 lg:gap-0 lg:px-5 lg:py-0",
                  GRID,
                )}
              >
                <span role="cell" className="order-3 text-[13px] text-ink-2 lg:order-none lg:text-sm">
                  {dayFirst(m.date)}
                </span>
                <span role="cell" className="order-1 flex min-w-0 flex-col lg:order-none lg:pr-3">
                  <span className="truncate text-[15px] font-medium">{title}</span>
                  {sub && <span className="truncate text-[13px] text-ink-3">{sub}</span>}
                </span>
                <span role="cell" className="hidden lg:block">
                  <span className={cn("rounded-full px-2.25 py-px text-[13px] font-semibold whitespace-nowrap", KIND_PILL[m.kind])}>
                    {t(`moves.${m.kind}`)}
                  </span>
                </span>
                <span role="cell" className="order-4 flex min-w-0 items-center gap-2 lg:order-none">
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[3px]", accountLook(index.get(m.accountId) ?? 0).color)} />
                  <span className="truncate">{m.accountName}</span>
                </span>
                <span role="cell" className="order-2 text-right font-semibold text-success lg:order-none lg:pr-3">
                  {m.amount > 0 ? formatAmount(m.amount) : ""}
                  <span className="lg:hidden">{m.amount < 0 ? <span className="text-ink">−{formatAmount(-m.amount)}</span> : null}</span>
                </span>
                <span role="cell" className="hidden pr-3 text-right font-semibold lg:block">
                  {m.amount < 0 ? formatAmount(-m.amount) : ""}
                </span>
                <span role="cell" className="hidden text-right text-ink-2 lg:block">
                  {signed(m.balance)}
                </span>
              </div>
            );
          })}
          {rows.length === 0 && <div className="px-6 py-12 text-center text-[15px] text-ink-3">{t("noRows")}</div>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-2 bg-surface-2 px-5 py-3.5 text-sm">
          <span className="text-ink-2">{t("footNote", { count: rows.length })}</span>
          <span className="flex gap-6">
            <span>
              {t("footIn")} <strong className="font-bold text-success">৳ {formatAmount(footIn)}</strong>
            </span>
            <span>
              {t("footOut")} <strong className="font-bold">৳ {formatAmount(footOut)}</strong>
            </span>
          </span>
        </div>
      </section>

      {dialog === "transfer" && <TransferDialog projectId={projectId} accounts={accounts} onClose={() => setDialog(null)} />}
      {dialog === "add" && <AccountFormDialog projectId={projectId} onClose={() => setDialog(null)} />}
    </>
  );
}
