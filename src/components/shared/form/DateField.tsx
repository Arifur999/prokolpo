"use client";

import { Icon } from "../icon/Icon";

type DateFieldProps = {
  id: string;
  // YYYY-MM-DD.
  value: string;
  onChange: (value: string) => void;
};

const dayFirst = (iso: string) => iso.split("-").reverse().join("/");

// Shows the date day-first ("03/10/2026") as the design does, whatever the browser's locale.
// The real date input lies invisibly on top, so a click or keypress opens the native picker.
export function DateField({ id, value, onChange }: DateFieldProps) {
  return (
    <div className="relative box-border flex h-12 w-full items-center justify-between rounded-lg border border-line bg-white pr-3 pl-3.5 text-base text-ink focus-within:border-[1.5px] focus-within:border-brand focus-within:shadow-focus">
      <span aria-hidden="true">{value ? dayFirst(value) : ""}</span>
      <Icon name="calendar" size={18} className="text-ink-3" />
      <input
        id={id}
        type="date"
        required
        value={value}
        onChange={(event) => event.target.value && onChange(event.target.value)}
        onClick={(event) => event.currentTarget.showPicker?.()}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  );
}
