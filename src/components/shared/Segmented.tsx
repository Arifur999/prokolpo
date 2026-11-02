"use client";

import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = { value: T; label: string; count?: number };

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  // md: 34px buttons on a 10px-radius track (lists); lg: 36px on 12px (dashboard).
  size?: "md" | "lg";
  className?: string;
};

// A row of mutually exclusive filter buttons on a grey track; the chosen one is raised.
export function Segmented<T extends string>({ label, value, options, onChange, size = "md", className }: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex shrink-0 gap-0.5 overflow-x-auto bg-canvas-deep", size === "lg" ? "rounded-xl p-1" : "rounded-lg p-0.75", className)}
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1.5 border-none px-3 text-sm whitespace-nowrap",
              size === "lg" ? "h-9 rounded-[9px] px-3.5" : "h-8.5 rounded-md",
              on ? "bg-white font-semibold text-ink shadow-tab" : "bg-transparent font-medium text-ink-2",
            )}
          >
            {option.label}
            {option.count !== undefined && <span className="text-[13px] font-medium text-ink-3">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
