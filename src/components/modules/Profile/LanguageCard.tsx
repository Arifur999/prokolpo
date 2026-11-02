"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setLanguageAction } from "@/app/(dashboardLayout)/(home)/profile/_action";
import type { Locale } from "@/i18n/config";
import { banglaWords, englishWords } from "@/lib/amountWords";
import { formatWeekdayDate } from "@/lib/dhakaTime";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ProfileCard } from "./ProfileCard";

const LANGS: { code: Locale; name: string }[] = [
  { code: "bn", name: "বাংলা" },
  { code: "en", name: "English" },
];
const SAMPLE_AMOUNT = 1_250_000;

const monthName = (date: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "bn" ? "bn-BD-u-nu-latn" : "en-GB", { timeZone: "Asia/Dhaka", month: "long", year: "numeric" }).format(date);

// "ভাষা ও ফরম্যাট" (board Profile): pick a language, see how dates and money read in it, then
// switch. Only this account's screens change; receipts follow the project's settings.
export function LanguageCard({ now }: { now: string }) {
  const t = useTranslations("Profile.language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [picked, setPicked] = useState<Locale>(locale);
  const [isPending, startTransition] = useTransition();
  const changed = picked !== locale;
  const date = new Date(now);

  const sample = [
    { label: t("today"), value: formatWeekdayDate(date, picked) },
    { label: t("month"), value: monthName(date, picked) },
    { label: t("money"), value: `৳ ${formatAmount(SAMPLE_AMOUNT)} · ${picked === "bn" ? banglaWords(SAMPLE_AMOUNT) : englishWords(SAMPLE_AMOUNT)}` },
  ];

  const apply = () =>
    startTransition(async () => {
      const result = await setLanguageAction(picked);
      if (!result.success) return void toast.error(result.message);
      router.refresh();
    });

  return (
    <ProfileCard
      id="pf-lang"
      title={t("title")}
      sub={t("sub")}
      compact
      footer={
        <>
          <span className={cn("min-h-10 content-center text-[13px] leading-[1.45]", changed ? "text-gold-ink" : "text-ink-3")}>
            {changed ? t(`note.${picked}`) : t("current", { name: LANGS.find((l) => l.code === locale)?.name ?? "" })}
          </span>
          {changed && (
            <button
              type="button"
              lang={picked}
              onClick={apply}
              disabled={isPending}
              className="h-10 shrink-0 cursor-pointer rounded-[10px] border-none bg-brand px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {t(`switch.${picked}`)}
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-3 px-5 py-4">
        <div role="radiogroup" aria-labelledby="pf-lang" className="grid grid-cols-2 gap-0.5 rounded-xl bg-canvas-deep p-0.75">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="radio"
              aria-checked={picked === l.code}
              lang={l.code}
              onClick={() => setPicked(l.code)}
              className={cn(
                "h-10.5 cursor-pointer rounded-[9px] border-none text-[15px]",
                picked === l.code ? "bg-white font-bold text-ink shadow-segment" : "bg-transparent font-medium text-ink-2",
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-1.5 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px]">
          {sample.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-ink-3">{row.label}</dt>
              <dd lang={picked} className="m-0 text-right font-semibold text-ink">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="m-0 text-xs leading-[1.55] text-ink-3">{t("rule")}</p>
      </div>
    </ProfileCard>
  );
}
