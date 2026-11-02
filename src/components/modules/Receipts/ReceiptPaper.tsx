import { Icon } from "@/components/shared/icon/Icon";
import { docLabel, type DocLang, type ReceiptDoc } from "@/lib/receiptDoc";
import { cn } from "@/lib/utils";

const FACT_TONE = { ink: "text-ink", good: "text-success", due: "text-gold-ink" };

// One copy of a printed receipt (board ReceiptPartner): letterhead, who paid what for what,
// the amount boxed with its words and a "received" stamp, the running figures, signatures.
export function ReceiptPaper({ doc, lang, copy, cut }: { doc: ReceiptDoc; lang: DocLang; copy: string; cut: boolean }) {
  const l = (key: Parameters<typeof docLabel>[1], inline = false) => docLabel(lang, key, inline);
  const dt = cn("whitespace-pre-line leading-[1.35] text-ink-3");

  return (
    <div className="relative box-border flex h-[561px] shrink-0 flex-col gap-3.25 px-11 pt-7.5 pb-5">
      {cut && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t-[1.5px] border-dashed border-[#B9B5AA]">
          <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 bg-white px-2 text-[11px] text-ink-4">
            <Icon name="scissors" size={12} strokeWidth={2} />
            {l("cut", true)}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11.5 shrink-0 items-center justify-center rounded-xl bg-brand font-heading text-2xl leading-none font-bold text-white"
          >
            {Array.from(doc.company)[0]}
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-[22px] leading-[1.25] font-bold">{doc.company}</span>
            <span className="text-xs text-ink-2">{doc.companyLine}</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="flex items-center gap-2">
            <span className="rounded-full border border-[#B9B5AA] px-2 text-[11px] font-semibold text-ink-2">{copy}</span>
            <strong className="text-lg font-bold">{l("title", true)}</strong>
          </span>
          <span className="text-[13px] text-ink-2">
            {l("no", true)} <strong className="font-bold text-ink">{doc.no}</strong> · {l("date", true)}{" "}
            <strong className="font-bold text-ink">{doc.date}</strong>
          </span>
        </div>
      </div>
      <div aria-hidden="true" className="h-0.5 shrink-0 bg-brand" />

      <div className="grid grid-cols-[minmax(0,1fr)_268px] items-start gap-5.5">
        <dl className={cn("m-0 grid gap-x-3 gap-y-2.25 text-sm", lang === "bn" ? "grid-cols-[96px_minmax(0,1fr)]" : "grid-cols-[120px_minmax(0,1fr)]")}>
          <dt className={dt}>{l("payer")}</dt>
          <dd className="m-0 flex flex-col">
            <strong className="text-base font-bold">{doc.payer}</strong>
            <span className="text-xs text-ink-2">{doc.payerSub}</span>
          </dd>
          <dt className={dt}>{l(doc.forKey)}</dt>
          <dd className="m-0 font-semibold">{doc.forText}</dd>
          <dt className={dt}>{l("purpose")}</dt>
          <dd className="m-0 flex flex-col">
            <strong className="font-bold">{doc.purpose}</strong>
            <span className="text-xs text-ink-2">{doc.purposeSub}</span>
          </dd>
          <dt className={dt}>{l("method")}</dt>
          <dd className="m-0 font-semibold">{doc.method}</dd>
        </dl>
        <div className="relative flex flex-col gap-0.5 rounded-xl border-[1.5px] border-brand bg-[#F7FAF8] px-4 py-3.5">
          <span className="text-xs font-semibold text-ink-2">{l("amount", true)}</span>
          <span className="text-[30px] leading-[1.2] font-bold">{doc.amount}</span>
          <span className="text-[13px] leading-normal whitespace-pre-line text-ink">
            {l("words", true)}: <strong className="font-semibold">{doc.words}</strong>
          </span>
          <span
            aria-hidden="true"
            className="absolute -top-3 -right-2 -rotate-9 rounded-lg border-2 border-success bg-white px-2.5 py-px text-[13px] font-bold tracking-[0.02em] text-success"
          >
            {l("stamp", true)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 rounded-[10px] bg-[#F3F2EE] px-3.5 py-2.5">
        {doc.facts.map((f) => (
          <span key={f.label} className="flex flex-col">
            <span className="text-[11px] leading-[1.35] whitespace-pre-line text-ink-3">{l(f.label)}</span>
            <strong className={cn("text-sm font-bold", FACT_TONE[f.tone])}>{f.value}</strong>
          </span>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-20 pt-4.5">
        <span className="border-t border-ink pt-1 text-xs text-ink-2">{l("sign", true)}</span>
        <span className="flex flex-col border-t border-ink pt-1 text-xs text-ink-2">
          {l("receiver", true)}: <strong className="text-[13px] font-semibold text-ink">{doc.receiver}</strong>
        </span>
      </div>
      <div className="flex justify-between gap-3 text-[11px] text-ink-4">
        <span>{doc.foot}</span>
        <span>{docLabel(lang === "en" ? "en" : "bn", "brand")}</span>
      </div>
    </div>
  );
}
