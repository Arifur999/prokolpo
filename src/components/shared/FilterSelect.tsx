"use client";

import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon/Icon";

export type FilterOption = { value: string; label: string };

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
};

// A list filter button ("সব খাত ▾") that opens its choices; "" is the "all" choice.
export function FilterSelect({ label, value, options, onChange, icon }: FilterSelectProps) {
  const current = options.find((option) => option.value === value)?.label ?? label;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label={`${label}: ${current}`}
        className={cn(
          "flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium text-ink",
          value !== options[0]?.value ? "border-brand" : "border-line",
        )}
      >
        {icon}
        {current}
        <Icon name="chevronDown" size={16} strokeWidth={2} className="text-ink-3" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-40 flex max-h-80 min-w-48 flex-col overflow-y-auto rounded-xl border border-line-2 bg-white p-1.5 shadow-raised"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenu.RadioItem
                key={option.value}
                value={option.value}
                className="flex h-9.5 cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 text-sm text-ink outline-none data-highlighted:bg-surface-2 data-[state=checked]:font-semibold"
              >
                {option.label}
                <DropdownMenu.ItemIndicator>
                  <Icon name="check" size={16} strokeWidth={2.2} className="text-brand" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
