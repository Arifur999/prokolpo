"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/_actions/localeActions";
import { Icon } from "@/components/shared/icon/Icon";
import { LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const LABELS: Record<Locale, string> = { bn: "বাংলা", en: "English" };

// The two-option pill at the top right of every sign-in screen.
export function AuthLanguageSwitch() {
  const t = useTranslations("Auth.brand");
  const current = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const choose = (locale: Locale) =>
    startTransition(async () => {
      await setLocaleAction(locale);
      router.refresh();
    });

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className="absolute top-6 right-8 z-2 flex items-center gap-0.5 rounded-full border border-line-2 bg-white p-[3px]"
    >
      <span className="flex pr-1.5 pl-[9px] text-brand">
        <Icon name="language" size={18} />
      </span>
      {LOCALES.map((locale) => {
        const isCurrent = locale === current;
        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-current={isCurrent}
            disabled={isPending || isCurrent}
            onClick={() => choose(locale)}
            className={cn(
              "flex h-9 items-center rounded-full border-none px-3.5 text-sm font-semibold",
              isCurrent ? "bg-brand text-white" : "cursor-pointer bg-transparent text-ink-2",
            )}
          >
            {LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
