"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Segmented } from "@/components/shared/Segmented";
import { Icon } from "@/components/shared/icon/Icon";
import { docLabel, type DocLang, type ReceiptDoc } from "@/lib/receiptDoc";
import { cn } from "@/lib/utils";
import { ReceiptPaper } from "./ReceiptPaper";

export type ReceiptListItem = { id: string; no: string; amount: string; sub: string; date: string; href: string };
export type ReceiptInfo = { amount: string; purpose: string; method: string; receiver: string; written: string; prints: number };

type ReceiptViewProps = {
  back: { href: string; label: string };
  headSub: string;
  docs: Record<DocLang, ReceiptDoc>;
  info: ReceiptInfo;
  listTitle: string;
  list: ReceiptListItem[];
  currentId: string;
  whatsapp: { phone: string; text: string };
  onPrinted: () => Promise<unknown>;
};

type Layout = "A4" | "A5";

// The receipt print view (board ReceiptPartner): A4 with two copies to cut, or one A5; the
// receipt's language; what this receipt is; and the payer's other receipts.
export function ReceiptView({ back, headSub, docs, info, listTitle, list, currentId, whatsapp, onPrinted }: ReceiptViewProps) {
  const t = useTranslations("Receipts");
  const [layout, setLayout] = useState<Layout>("A4");
  const [lang, setLang] = useState<DocLang>("bn");
  const [prints, setPrints] = useState(info.prints);
  const doc = docs[lang];
  const copies = layout === "A4" ? [docLabel(lang, doc.copyKey, true), docLabel(lang, "office", true)] : [docLabel(lang, doc.copyKey, true)];

  const print = () => {
    setPrints((n) => n + 1);
    void onPrinted();
    window.print();
  };
  const share = () => window.open(`https://wa.me/88${whatsapp.phone}?text=${encodeURIComponent(whatsapp.text)}`, "_blank", "noopener");
  const tool = "flex h-10.5 cursor-pointer items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-ink";

  return (
    <div className="flex min-h-screen flex-col bg-canvas-deep print:block print:min-h-0 print:bg-white">
      <style>{`@page { size: ${layout === "A4" ? "A4" : "A5 landscape"}; margin: 0 }`}</style>
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-line-2 bg-white px-4 py-3 lg:h-17 lg:px-7 lg:py-0 print:hidden">
        <div className="flex items-center gap-4">
          <Link href={back.href} className="flex h-10 items-center gap-1.5 rounded-[10px] pr-3 pl-2 text-[15px] font-semibold text-ink no-underline">
            <Icon name="chevronLeft" size={18} strokeWidth={2} />
            {back.label}
          </Link>
          <span aria-hidden="true" className="h-7 w-px bg-line-2" />
          <h1 className="m-0 flex items-baseline gap-2.5 text-xl font-semibold">
            {t("title")} <span className="text-[17px] font-bold text-brand">{doc.no}</span>
            <span className="hidden text-sm font-normal text-ink-3 sm:inline">{headSub}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Segmented
            label={t("layoutLabel")}
            value={layout}
            onChange={setLayout}
            options={[
              { value: "A4", label: t("layoutA4") },
              { value: "A5", label: t("layoutA5") },
            ]}
          />
          <button type="button" onClick={share} className={tool}>
            <Icon name="whatsapp" size={16} strokeWidth={2} />
            {t("whatsapp")}
          </button>
          <button type="button" onClick={print} className={tool}>
            <Icon name="download" size={16} strokeWidth={2} />
            PDF
          </button>
          <button
            type="button"
            onClick={print}
            className="flex h-10.5 cursor-pointer items-center gap-2 rounded-[10px] border-none bg-brand px-4.5 text-[15px] font-semibold text-white"
          >
            <Icon name="printer" size={18} strokeWidth={2} />
            {t("print")}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 grow flex-col lg:flex-row print:block">
        <main className="flex min-w-0 grow flex-col items-center gap-3 overflow-x-auto px-6 py-7 print:p-0">
          <span className="text-[13px] text-ink-3 print:hidden">{layout === "A4" ? t("paperA4", { copy: copies[0] ?? "" }) : t("paperA5")}</span>
          <div
            role="document"
            lang={lang === "en" ? "en" : "bn"}
            aria-label={t("paperLabel", { no: doc.no })}
            className="flex w-[794px] shrink-0 flex-col bg-white shadow-raised print:shadow-none"
          >
            {copies.map((copy, i) => (
              <ReceiptPaper key={copy} doc={doc} lang={lang} copy={copy} cut={i > 0} />
            ))}
          </div>
        </main>

        <aside
          aria-label={t("asideLabel")}
          className="box-border flex w-full shrink-0 flex-col gap-4.5 border-l border-line-2 bg-white px-5 py-5.5 lg:w-85 print:hidden"
        >
          <section aria-labelledby="rlg-title" className="flex flex-col gap-2.5">
            <h2 id="rlg-title" className="m-0 text-base font-semibold">
              {t("langTitle")}
            </h2>
            <Segmented
              label={t("langTitle")}
              value={lang}
              onChange={setLang}
              className="grid grid-cols-3"
              options={[
                { value: "bn", label: t("langBn") },
                { value: "en", label: t("langEn") },
                { value: "both", label: t("langBoth") },
              ]}
            />
            <p className="m-0 text-[13px] leading-[1.55] text-ink-3">{lang === "bn" ? t("langNote") : t("langNoteChanged")}</p>
          </section>
          <section aria-labelledby="ri-title" className="flex flex-col gap-2.5">
            <h2 id="ri-title" className="m-0 text-base font-semibold">
              {t("thisTitle")}
            </h2>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              {(
                [
                  ["amount", info.amount],
                  ["purpose", info.purpose],
                  ["account", info.method],
                  ["receiver", info.receiver],
                  ["written", info.written],
                  ["printed", prints ? t("printedTimes", { count: prints }) : t("notPrinted")],
                ] as const
              ).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-ink-3">{t(`info.${key}`)}</dt>
                  <dd className={cn("m-0 text-right", key === "amount" && "font-bold")}>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="rl-title" className="flex flex-col gap-2">
            <h2 id="rl-title" className="m-0 text-base font-semibold">
              {listTitle}
            </h2>
            <ul className="m-0 flex list-none flex-col overflow-hidden rounded-xl border border-line-2 p-0">
              {list.map((r) => {
                const on = r.id === currentId;
                return (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 border-b border-line-3 px-3 py-2.25 text-ink no-underline",
                        on ? "bg-brand-wash shadow-[inset_3px_0_0_var(--color-brand)]" : "bg-white",
                      )}
                    >
                      <span className="text-sm font-bold">{r.no}</span>
                      <span className="text-right text-sm font-semibold">{r.amount}</span>
                      <span className="text-xs text-ink-3">{r.sub}</span>
                      <span className="text-right text-xs text-ink-3">{r.date}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          <p className="m-0 flex items-start gap-2 rounded-[10px] bg-surface-2 p-3 text-[13px] leading-[1.6] text-ink-2">
            <Icon name="info" size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
            <span>{t("numberNote")}</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
