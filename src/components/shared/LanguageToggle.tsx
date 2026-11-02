"use client";

import { useSwitchLanguage } from "@/hooks/useSwitchLanguage";
import { cn } from "@/lib/utils";
import { Icon } from "./icon/Icon";

type LanguageToggleProps = {
  // The label names the other language in its own script ("English" on a Bangla page).
  label: string;
  className?: string;
  // The header shows the language glyph; the footer link is text only.
  withIcon?: boolean;
  iconClassName?: string;
};

export function LanguageToggle({ label, className, withIcon = true, iconClassName }: LanguageToggleProps) {
  const { target, switchLanguage, isPending } = useSwitchLanguage();

  return (
    <button type="button" lang={target} onClick={switchLanguage} disabled={isPending} className={cn("cursor-pointer", className)}>
      {withIcon && (
        <span className={cn("flex", iconClassName)}>
          <Icon name="language" size={18} />
        </span>
      )}
      {label}
    </button>
  );
}
