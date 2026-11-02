import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TextInputProps = ComponentProps<"input"> & { invalid?: boolean };

// The design's 48px input: 1px #D3D0C6 border, and a red 1.5px border on a pale red field when invalid.
export function TextInput({ invalid = false, className, ...props }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid}
      className={cn(
        "h-12 w-full rounded-lg px-3.5 text-base text-ink outline-none placeholder:text-ink-4",
        "focus:border-[1.5px] focus:border-brand focus:shadow-focus",
        "disabled:bg-surface-4 disabled:text-ink-2",
        invalid ? "border-[1.5px] border-danger-strong bg-danger-wash" : "border border-line bg-white",
        className,
      )}
      {...props}
    />
  );
}
