import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  id: string;
  title: ReactNode;
  hint?: string;
  children: ReactNode;
  // lg: 32px sides, 28px tall (new project); md: 28px and 24px (expense form).
  inset?: "lg" | "md";
  className?: string;
};

// One titled block of a form card; a hairline separates it from the one before.
export function FormSection({ id, title, hint, children, inset = "lg", className }: FormSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("flex flex-col gap-3.5 border-t border-line-3 px-5 first:border-t-0 sm:px-0", inset === "lg" ? "py-7 sm:mx-8" : "py-6 sm:mx-7", className)}
    >
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
