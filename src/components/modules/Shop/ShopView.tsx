"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { collectKhataAction } from "@/app/(dashboardLayout)/projects/[projectId]/biz-sales/_action";
import { ProjectPageHeader } from "@/components/modules/Project/ProjectPageHeader";
import { CollectDueDialog } from "@/components/shared/CollectDueDialog";
import { ExcelButton } from "@/components/shared/ExcelButton";
import { Icon } from "@/components/shared/icon/Icon";
import { formatWeekdayDate } from "@/lib/dhakaTime";
import { monthName } from "@/lib/months";
import { shopFigures } from "@/lib/shopLook";
import { shopSheet } from "@/lib/shopSheet";
import type { IAccount } from "@/types/books.types";
import type { IKhataPerson, IShopBook } from "@/types/shop.types";
import { DailyChart } from "./DailyChart";
import { DayDialog } from "./day/DayDialog";
import { DayTable } from "./DayTable";
import { KhataList } from "./KhataList";
import { ShopSummary } from "./ShopSummary";

type ShopViewProps = {
  projectId: string;
  projectName: string;
  businessType: string | null;
  book: IShopBook;
  accounts: IAccount[];
  today: string;
  canWrite: boolean;
};

type Open = { kind: "day"; date: string } | { kind: "collect"; person: IKhataPerson } | null;

// The shop's sales page (boards BizSales, BizDayNew): this month and last, a bar a day, the
// day book and the credit book.
export function ShopView({ projectId, projectName, businessType, book, accounts, today, canWrite }: ShopViewProps) {
  const t = useTranslations("Shop");
  const locale = useLocale() as "bn" | "en";
  const [open, setOpen] = useState<Open>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const f = shopFigures(book, today);
  const nameOf = (month: string) => monthName(new Date(`${month}-15`), locale, "long");
  const cash = accounts.find((a) => a.kind === "CASH") ?? accounts[0];
  const openToday = () => setOpen({ kind: "day", date: today });

  return (
    <>
      <ProjectPageHeader
        projectName={[projectName, businessType].filter(Boolean).join(" · ")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <ExcelButton
              label={t("excel")}
              done={t("exported")}
              sheet={() => shopSheet(book, (key, values) => t(key as Parameters<typeof t>[0], values))}
              file={`${projectName} - ${t("title")}`}
            />
            {canWrite && (
              <button
                type="button"
                onClick={openToday}
                className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white"
              >
                <Icon name={f.todayDone ? "pencil" : "plus"} size={18} strokeWidth={2.2} />
                {f.todayDone ? t("editToday") : t("today")}
              </button>
            )}
          </>
        }
      />
      {canWrite && !f.todayDone && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-gold-line bg-gold-wash px-4 py-3 text-[15px] text-gold-deep">
          <Icon name="clock" size={20} strokeWidth={2} className="shrink-0" />
          <span className="grow">
            <strong className="font-bold">{t("missing", { date: formatWeekdayDate(new Date(today), locale) })}</strong> {t("missingSub")}
          </span>
          <button
            type="button"
            onClick={openToday}
            className="h-9 cursor-pointer rounded-[9px] border border-gold-ink bg-white px-3.5 text-sm font-semibold text-gold-deep"
          >
            {t("writeNow")}
          </button>
        </div>
      )}
      <ShopSummary figures={f} monthName={nameOf(f.month)} lastName={nameOf(f.last)} khataCount={book.khata.length} />
      <DailyChart figures={f} monthName={nameOf(f.last)} />
      <div className="grid grid-cols-1 items-start gap-5.5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <DayTable days={book.days} highlight={highlight} canWrite={canWrite} onEdit={(d) => setOpen({ kind: "day", date: d.date })} />
        <KhataList khata={book.khata} today={today} canWrite={canWrite} onCollect={(person) => setOpen({ kind: "collect", person })} />
      </div>
      {open?.kind === "day" && (
        <DayDialog
          projectId={projectId}
          book={book}
          accounts={accounts}
          date={open.date}
          onClose={() => setOpen(null)}
          onSaved={(date) => {
            setHighlight(book.days.find((d) => d.date === date)?.id ?? null);
            setOpen(null);
          }}
        />
      )}
      {open?.kind === "collect" && cash && (
        <CollectDueDialog
          namespace="Shop.collect"
          name={open.person.name}
          due={open.person.due}
          note={t("collect.note")}
          widthClass="max-w-120"
          save={(amount) => collectKhataAction(projectId, open.person.id, { amount, accountId: cash.id })}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
