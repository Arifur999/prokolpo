"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveShopDayAction } from "@/app/(dashboardLayout)/projects/[projectId]/biz-sales/_action";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { formatWeekdayDate } from "@/lib/dhakaTime";
import { dayFirst } from "@/lib/expenseText";
import { formatAmount } from "@/lib/money";
import { khataAfter, nameKey, sameWeekday } from "@/lib/shopLook";
import type { IAccount } from "@/types/books.types";
import type { IShopBook, IShopDay } from "@/types/shop.types";
import { DayAside, type Flow } from "./DayAside";
import { type DayDraft, dayProblem, dayTotals, draftFrom, lines, payable } from "./dayDraft";
import { DayLines } from "./DayLines";

type DayDialogProps = {
  projectId: string;
  book: IShopBook;
  accounts: IAccount[];
  date: string;
  onClose: () => void;
  onSaved: (date: string) => void;
};

const pick = (accounts: IAccount[], ...kinds: IAccount["kind"][]) => kinds.map((k) => accounts.find((a) => a.kind === k)).find(Boolean) ?? accounts[0];

// "দিনের হিসাব" (board BizDayNew): one entry for a day — cash, bKash and credit sales, who
// paid back, other income — with where the money lands and a cash count beside it.
export function DayDialog({ projectId, book, accounts, date, onClose, onSaved }: DayDialogProps) {
  const t = useTranslations("Shop.form");
  const locale = useLocale() as "bn" | "en";
  const router = useRouter();
  const editing = book.days.find((d) => d.date === date) ?? null;
  const [draft, setDraft] = useState<DayDraft>(() => draftFrom(editing));
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const change = (patch: Partial<DayDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const cash = accounts.find((a) => a.id === editing?.cashAccountId) ?? pick(accounts, "CASH");
  const mobile = accounts.find((a) => a.id === editing?.mobileAccountId) ?? pick(accounts, "MOBILE", "BANK", "CASH");
  const totals = dayTotals(draft);
  const problem = submitted ? dayProblem(draft, book.khata, editing) : null;

  // On an edit the balances already hold the day as first written; take it out to show before.
  const was = editing ?? ({ cash: 0, mobile: 0, other: 0, credits: [], collects: [] } as Pick<IShopDay, "cash" | "mobile" | "other" | "credits" | "collects">);
  const wasCash = was.cash + was.other + was.collects.reduce((n, l) => n + l.amount, 0);
  const khataNow = book.khata.reduce((n, k) => n + k.due, 0);
  const khataBefore = khataNow - was.credits.reduce((n, l) => n + l.amount, 0) + was.collects.reduce((n, l) => n + l.amount, 0);
  const restored = book.khata.map((k) => ({
    ...k,
    due:
      k.due -
      was.credits.filter((l) => nameKey(l.name) === nameKey(k.name)).reduce((n, l) => n + l.amount, 0) +
      was.collects.filter((l) => nameKey(l.name) === nameKey(k.name)).reduce((n, l) => n + l.amount, 0),
  }));
  const flows: Flow[] = [];
  if (cash) flows.push({ key: "cash", title: cash.name, before: cash.balance - wasCash, after: cash.balance - wasCash + totals.cashIn, up: "good" });
  if (mobile && mobile.id !== cash?.id) {
    flows.push({
      key: "mobile",
      title: mobile.name,
      before: mobile.balance - was.mobile,
      after: mobile.balance - was.mobile + Number(draft.mobile || 0),
      up: "good",
    });
  }
  flows.push({ key: "khata", title: t("khata"), before: khataBefore, after: khataAfter(restored, lines(draft.credits), lines(draft.collects)), up: "owed" });

  const money = [
    { id: "mf-cash", label: t("cash"), help: t("cashHelp"), value: draft.cash, set: (cashDigits: string) => change({ cash: cashDigits }) },
    { id: "mf-mobile", label: t("mobile"), help: t("mobileHelp"), value: draft.mobile, set: (mobileDigits: string) => change({ mobile: mobileDigits }) },
  ];

  const save = () => {
    setSubmitted(true);
    if (dayProblem(draft, book.khata, editing) || !cash || !mobile) return;
    startTransition(async () => {
      const result = await saveShopDayAction(projectId, {
        date,
        cash: Number(draft.cash || 0),
        mobile: Number(draft.mobile || 0),
        other: Number(draft.other || 0),
        note: draft.note,
        counted: draft.counted ? Number(draft.counted) : null,
        cashAccountId: cash.id,
        mobileAccountId: mobile.id,
        credits: lines(draft.credits),
        collects: lines(draft.collects),
      });
      if (!result.success) return void toast.error(result.message);
      toast.success(t("done", { date: dayFirst(date), amount: formatAmount(totals.sales) }));
      onSaved(date);
      router.refresh();
    });
  };

  return (
    <FormDialog
      title={t("title", { date: formatWeekdayDate(new Date(date), locale) })}
      subtitle={t("sub")}
      closeLabel={t("close")}
      onClose={onClose}
      widthClass="max-w-225"
      topClass="top-8"
      bodyClass="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px]"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-danger">{problem ? t(problem) : ""}</span>
          <DialogButtons cancel={t("cancel")} submit={t("save")} onCancel={onClose} onSubmit={save} pending={isPending} />
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 pt-4 pb-4.5">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold">{t("sales")}</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {money.map((m) => (
              <div key={m.id} className="flex flex-col gap-1">
                <label htmlFor={m.id} className="text-[13px] font-semibold text-ink-2">
                  {m.label}
                </label>
                <MoneyInput id={m.id} placeholder="0" value={m.value} onChange={m.set} wrapperClassName="h-11.5 rounded-[10px] px-3" className="text-[17px]" />
                <span className="text-xs text-ink-3">{m.help}</span>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label htmlFor="mf-credit" className="text-[13px] font-semibold text-ink-2">
                {t("credit")}
              </label>
              <MoneyInput
                id="mf-credit"
                readOnly
                placeholder="0"
                value={totals.credit ? String(totals.credit) : ""}
                onChange={() => undefined}
                wrapperClassName="h-11.5 rounded-[10px] bg-surface-2 px-3"
                className="text-[17px]"
              />
              <span className="text-xs text-ink-3">{t("creditHelp")}</span>
            </div>
          </div>
        </div>
        <DayLines kind="credits" rows={draft.credits} onChange={(credits) => change({ credits })} />
        <DayLines kind="collects" rows={draft.collects} onChange={(collects) => change({ collects })} payable={(name) => payable(book.khata, editing, name)} />
        <datalist id="khata-names">
          {book.khata.map((k) => (
            <option key={k.id} value={k.name} />
          ))}
        </datalist>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[170px_minmax(0,1fr)]">
          <div className="flex flex-col gap-1">
            <label htmlFor="oth" className="text-[13px] font-semibold text-ink-2">
              {t("other")} <span className="font-normal">{t("optional")}</span>
            </label>
            <MoneyInput
              id="oth"
              placeholder="0"
              value={draft.other}
              onChange={(other) => change({ other })}
              wrapperClassName="h-10.5 gap-1.5 rounded-[10px] px-2.5"
              className="text-[15px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dnote" className="text-[13px] font-semibold text-ink-2">
              {t("note")} <span className="font-normal">{t("optional")}</span>
            </label>
            <input
              id="dnote"
              type="text"
              maxLength={200}
              placeholder={t("notePlaceholder")}
              value={draft.note}
              onChange={(event) => change({ note: event.target.value })}
              className="box-border h-10.5 w-full rounded-[10px] border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:shadow-focus"
            />
          </div>
        </div>
      </div>
      <DayAside
        sales={totals.sales}
        compare={sameWeekday(book.days, date)}
        flows={flows}
        expectCash={totals.cashIn}
        counted={draft.counted}
        onCounted={(counted) => change({ counted })}
      />
    </FormDialog>
  );
}
