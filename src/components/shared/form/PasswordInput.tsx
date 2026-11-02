"use client";

import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { TextInput } from "./TextInput";

type PasswordInputProps = Omit<ComponentProps<typeof TextInput>, "type">;

export function PasswordInput(props: PasswordInputProps) {
  const t = useTranslations("Auth.password");
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <TextInput {...props} type={isVisible ? "text" : "password"} className={cn("pr-13", props.className)} />
      <button
        type="button"
        aria-label={isVisible ? t("hide") : t("show")}
        onClick={() => setIsVisible((visible) => !visible)}
        className="absolute top-0.5 right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-ink-3"
      >
        <Icon name={isVisible ? "eyeOff" : "eye"} />
      </button>
    </div>
  );
}
