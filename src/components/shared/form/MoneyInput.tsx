"use client";

import type { ComponentProps } from "react";
import { formatAmount, toLatinDigits } from "@/lib/money";
import { cn } from "@/lib/utils";

type MoneyInputProps = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  // Whole taka as digits ("2500000"), or "" for none.
  value: string;
  onChange: (digits: string) => void;
  invalid?: boolean;
  maxDigits?: number;
  wrapperClassName?: string;
};

// ৳ and a number that groups as it is typed ("2,50,00,000"); Bangla digits work too.
export function MoneyInput({ value, onChange, invalid, maxDigits = 11, wrapperClassName, className, ...props }: MoneyInputProps) {
  return (
    <div
      className={cn(
        "box-border flex h-12 items-center gap-2 rounded-lg px-3.5 focus-within:border-brand focus-within:shadow-focus",
        invalid ? "border-[1.5px] border-danger-strong bg-danger-wash" : "border border-line bg-white",
        wrapperClassName,
      )}
    >
      <span aria-hidden="true" className="text-lg font-semibold text-ink-2">
        ৳
      </span>
      <input
        inputMode="numeric"
        aria-invalid={invalid}
        value={value ? formatAmount(Number(value)) : ""}
        onChange={(event) => onChange(toLatinDigits(event.target.value).slice(0, maxDigits))}
        className={cn(
          "h-full min-w-0 grow border-none bg-transparent p-0 text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-4",
          className,
        )}
        {...props}
      />
    </div>
  );
}
