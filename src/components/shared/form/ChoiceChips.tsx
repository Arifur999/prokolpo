"use client";

import { cn } from "@/lib/utils";

export type Choice<T extends string> = { value: T; label: string };

type ChoiceChipsProps<T extends string> = {
  // The group's name for screen readers; pass `labelledBy` instead when a visible title names it.
  label?: string;
  labelledBy?: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  // pill: rounded options (what was sold); box: squarer (which batch); tiny: a unit under a field.
  shape?: "pill" | "box" | "tiny";
};

const SHAPE = {
  pill: "h-9.5 rounded-full px-3.5 text-sm",
  box: "h-9 rounded-[10px] px-3 text-sm",
  tiny: "h-7 rounded-full px-2.5 text-xs",
};

// One choice from a few, as a row of chips (board FarmSales).
export function ChoiceChips<T extends string>({ label, labelledBy, choices, value, onChange, shape = "pill" }: ChoiceChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} aria-labelledby={labelledBy} className={cn("flex flex-wrap", shape === "tiny" ? "gap-1" : "gap-1.5")}>
      {choices.map((c) => {
        const on = c.value === value;
        return (
          <button
            key={c.value || "none"}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(c.value)}
            className={cn(
              "cursor-pointer text-ink",
              SHAPE[shape],
              on ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
