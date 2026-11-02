import { useTranslations } from "next-intl";
import { dayFirst } from "@/lib/expenseText";
import type { IReceiptPayload, ReceiptLang } from "@/types/settings.types";

// Receipt words in each language the owner can pick; "both" prints them side by side.
const WORDS: Record<"bn" | "en", { title: string; project: string; no: string; date: string }> = {
  bn: { title: "টাকা জমার রশিদ", project: "প্রজেক্ট:", no: "নং", date: "তারিখ" },
  en: { title: "Money Receipt", project: "Project:", no: "No.", date: "Date" },
};
const word = (lang: ReceiptLang, key: keyof (typeof WORDS)["bn"]) => (lang === "both" ? `${WORDS.bn[key]} / ${WORDS.en[key]}` : WORDS[lang][key]);

type ReceiptPreviewProps = { projectName: string; values: IReceiptPayload; next: number; prefix: string; today: string };

// The top of a receipt and a sample reminder, as they will look with the form's values.
export function ReceiptPreview({ projectName, values, next, prefix, today }: ReceiptPreviewProps) {
  const t = useTranslations("Settings.receipt");
  const number = `${prefix}-${String(next).padStart(6, "0")}`;
  const company = values.company.trim() || projectName;
  const reminders = (["bn", "en"] as const).filter((lang) => values.lang === "both" || values.lang === lang);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[13px] font-semibold text-ink-2">{t("previewTitle")}</span>
      <div aria-label={t("previewLabel")} className="flex flex-col gap-2 rounded-lg border border-line bg-white px-4 py-3.5 shadow-card">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] bg-brand font-heading text-lg font-bold text-white"
          >
            {[...company][0]}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-heading text-[17px] leading-tight font-bold">{company}</span>
            <span className="text-[10px] text-ink-2">
              {[`${word(values.lang, "project")} ${projectName}`, values.address, values.phone].filter(Boolean).join(" · ")}
            </span>
          </span>
        </div>
        <div aria-hidden="true" className="h-0.5 bg-brand" />
        <div className="flex justify-between gap-2 text-[11px]">
          <strong className="font-bold">{word(values.lang, "title")}</strong>
          <span className="whitespace-nowrap">
            {word(values.lang, "no")} <strong>{number}</strong> · {word(values.lang, "date")} {dayFirst(today)}
          </span>
        </div>
        {values.footer.trim() && <span className="border-t border-dashed border-line pt-1.5 text-[10px] text-ink-2">{values.footer}</span>}
      </div>
      <span className="text-xs leading-normal text-ink-3">
        {t.rich("nextNote", { no: number, strong: (chunks) => <strong className="text-ink">{chunks}</strong> })}
      </span>
      <span className="mt-1.5 text-[13px] font-semibold text-ink-2">{t("reminderTitle")}</span>
      <div
        aria-label={t("reminderLabel")}
        className="flex flex-col gap-2 rounded-xl rounded-bl-sm bg-brand-tint px-3.5 py-3 text-[13px] leading-[1.55] text-ink"
      >
        {reminders.map((lang) => (
          <p key={lang} lang={lang} className="m-0">
            {t(`reminder.${lang}`, { company, phone: values.phone })}
          </p>
        ))}
      </div>
    </div>
  );
}
