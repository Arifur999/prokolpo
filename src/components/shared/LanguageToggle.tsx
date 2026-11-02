"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/_actions/localeActions";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { Icon } from "./icon/Icon";

type LanguageToggleProps = {
  // The label names the other language in its own script ("English" on a Bangla page).
  label: string;
  className?: string;
  iconClassName?: string;
};

export function LanguageToggle({ label, className, iconClassName }: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const target: Locale = locale === "bn" ? "en" : "bn";

  const switchLanguage = () =>
    startTransition(async () => {
      await setLocaleAction(target);
      router.refresh();
    });

  return (
    <button type="button" lang={target} onClick={switchLanguage} disabled={isPending} className={cn("cursor-pointer", className)}>
      <span className={cn("flex", iconClassName)}>
        <Icon name="language" size={18} />
      </span>
      {label}
    </button>
  );
}
