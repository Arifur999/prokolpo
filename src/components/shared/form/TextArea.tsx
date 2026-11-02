import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TextAreaProps = ComponentProps<"textarea"> & { invalid?: boolean };

// Multi-line counterpart of TextInput: same borders and focus ring, resizes vertically.
export function TextArea({ invalid = false, className, ...props }: TextAreaProps) {
  return (
    <textarea
      aria-invalid={invalid}
      className={cn(
        "w-full resize-y rounded-lg px-3 py-2.5 text-[15px] leading-[1.55] text-ink outline-none placeholder:text-ink-4",
        "focus:border-[1.5px] focus:border-brand focus:shadow-focus",
        invalid ? "border-[1.5px] border-danger-strong bg-danger-wash" : "border border-line bg-white",
        className,
      )}
      {...props}
    />
  );
}
