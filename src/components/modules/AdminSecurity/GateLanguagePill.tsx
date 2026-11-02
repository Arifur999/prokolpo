"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/_actions/localeActions";
import { Icon } from "@/components/shared/icon/Icon";

const OTHER = { bn: { locale: "en", label: "English" }, en: { locale: "bn", label: "বাংলা" } } as const;

// The language pill on the dark admin sign-in header: it names the other language.
export function GateLanguagePill() {
  const other = OTHER[useLocale() as "bn" | "en"];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      lang={other.locale}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setLocaleAction(other.locale);
          router.refresh();
        })
      }
      className="box-border flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-transparent pr-4 pl-3.5 text-[15px] font-semibold text-white"
    >
      <span className="flex text-gold-light">
        <Icon name="language" size={18} strokeWidth={1.8} />
      </span>
      {other.label}
    </button>
  );
}
