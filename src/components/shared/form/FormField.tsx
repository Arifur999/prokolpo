import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: ReactNode;
  // Shown after the label in normal weight, e.g. "(ঐচ্ছিক)".
  labelNote?: ReactNode;
  // Sits at the end of the label row, e.g. "পাসওয়ার্ড ভুলে গেছেন?".
  labelAside?: ReactNode;
  children: ReactNode;
  className?: string;
};

// Label above control, 6px apart (8px with an aside, as the login board has it).
export function FormField({ id, label, labelNote, labelAside, children, className }: FormFieldProps) {
  const labelEl = (
    <label htmlFor={id} className="text-[15px] font-semibold">
      {label}
      {labelNote && <span className="font-normal text-ink-3"> {labelNote}</span>}
    </label>
  );
  return (
    <div className={cn("flex flex-col", labelAside ? "gap-2" : "gap-1.5", className)}>
      {labelAside ? (
        <div className="flex items-baseline justify-between gap-3">
          {labelEl}
          {labelAside}
        </div>
      ) : (
        labelEl
      )}
      {children}
    </div>
  );
}
