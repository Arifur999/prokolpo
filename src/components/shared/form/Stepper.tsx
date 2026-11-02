"use client";

import { toLatinDigits } from "@/lib/money";
import { Icon } from "../icon/Icon";

type StepperProps = {
  id: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  lessLabel: string;
  moreLabel: string;
};

const buttonClass =
  "flex h-full w-13 shrink-0 cursor-pointer items-center justify-center border-none bg-surface-2 text-ink disabled:cursor-default disabled:text-ink-disabled";

// − 6 + : a count from 0 to max that can also be typed (Bangla digits too).
export function Stepper({ id, value, max, onChange, lessLabel, moreLabel }: StepperProps) {
  const set = (n: number) => onChange(Math.max(0, Math.min(max, n)));

  return (
    <div className="box-border flex h-12 w-44 items-center overflow-hidden rounded-lg border border-line bg-white focus-within:border-brand focus-within:shadow-focus">
      <button type="button" aria-label={lessLabel} onClick={() => set(value - 1)} disabled={value <= 0} className={`${buttonClass} border-r border-r-line-2`}>
        <Icon name="minus" size={18} strokeWidth={2.2} />
      </button>
      <input
        id={id}
        inputMode="numeric"
        placeholder="0"
        value={value ? String(value) : ""}
        onChange={(event) => set(Number(toLatinDigits(event.target.value) || 0))}
        className="h-full w-17.5 min-w-0 border-none bg-transparent p-0 text-center text-[17px] font-semibold text-ink outline-none placeholder:text-ink-4"
      />
      <button type="button" aria-label={moreLabel} onClick={() => set(value + 1)} disabled={value >= max} className={`${buttonClass} border-l border-l-line-2`}>
        <Icon name="plus" size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}
