import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "../icon/Icon";

type SelectFieldProps = ComponentProps<"select"> & { invalid?: boolean };

// The design's 48px native select with its own chevron.
export function SelectField({ invalid, className, children, ...props }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid}
        className={cn(
          "h-12 w-full cursor-pointer appearance-none rounded-lg pr-9 pl-3.5 text-base text-ink outline-none focus:border-brand focus:shadow-focus",
          invalid ? "border-[1.5px] border-danger-strong bg-danger-wash" : "border border-line bg-white",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Icon name="chevronDown" size={16} strokeWidth={2} className="pointer-events-none absolute top-4 right-3 text-ink-3" />
    </div>
  );
}
