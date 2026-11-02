import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  id: string;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

// One titled block of the new-project card; a hairline separates it from the one before.
export function FormSection({ id, title, hint, children, className }: FormSectionProps) {
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-3.5 border-t border-line-3 px-5 py-7 first:border-t-0 sm:mx-8 sm:px-0", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="m-0 text-[17px] leading-[1.4] font-semibold">
          {title}
        </h2>
        {hint && <p className="m-0 text-sm text-ink-3">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
