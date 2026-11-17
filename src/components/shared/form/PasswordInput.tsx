"use client";

import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";
import { TextInput } from "./TextInput";

type PasswordInputProps = Omit<ComponentProps<typeof TextInput>, "type"> & {
  // Controlled visibility, for a form that reveals a password it just generated.
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
};

export function PasswordInput({ visible, onVisibleChange, ...props }: PasswordInputProps) {
  const t = useTranslations("Auth.password");
  const [ownVisible, setOwnVisible] = useState(false);
  const isVisible = visible ?? ownVisible;
  const toggle = () => (onVisibleChange ?? setOwnVisible)(!isVisible);

  return (
    <div className="relative">
      <TextInput {...props} type={isVisible ? "text" : "password"} className={cn("pr-13", props.className)} />
      <button
        type="button"
        aria-label={isVisible ? t("hide") : t("show")}
        onClick={toggle}
        className="absolute top-0.5 right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-ink-3"
      >
        <Icon name={isVisible ? "eyeOff" : "eye"} />
      </button>
    </div>
  );
}
