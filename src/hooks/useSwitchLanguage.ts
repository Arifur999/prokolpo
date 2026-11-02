"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/_actions/localeActions";
import type { Locale } from "@/i18n/config";

// Saves the other language in the cookie and re-renders the page in it.
export function useSwitchLanguage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const target: Locale = locale === "bn" ? "en" : "bn";

  const switchLanguage = () =>
    startTransition(async () => {
      await setLocaleAction(target);
      router.refresh();
    });

  return { locale, target, switchLanguage, isPending };
}
