import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SettingsCardProps = {
  id: string;
  title: string;
  sub?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

// One white card of a settings tab: a titled header, its body and an optional save bar.
export function SettingsCard({ id, title, sub, aside, footer, className, children }: SettingsCardProps) {
  return (
    <section aria-labelledby={id} className={cn("flex min-w-0 flex-col rounded-2xl border border-line-2 bg-white", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line-3 px-5.5 py-4">
        <div className="flex min-w-0 flex-col">
          <h2 id={id} className="m-0 text-lg font-semibold">
            {title}
          </h2>
          {sub && <span className="text-[13px] text-ink-3">{sub}</span>}
        </div>
        {aside}
      </div>
      {children}
      {footer}
    </section>
  );
}

// A danger-zone card (board SettingsSupport): a title and text with its action beside it.
export function ActionCard({
  id,
  title,
  body,
  action,
  tone = "plain",
  children,
}: {
  id: string;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  tone?: "plain" | "danger" | "gold";
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl bg-white px-5.5 py-4.5",
        tone === "danger" ? "border-[1.5px] border-danger-line" : tone === "gold" ? "border-[1.5px] border-gold-border" : "border border-line-2",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-0.5 sm:max-w-[70%]">
          <h2 id={id} className={cn("m-0 text-[17px] font-semibold", tone === "danger" && "text-danger")}>
            {title}
          </h2>
          <span className="text-sm leading-[1.55] text-ink-2">{body}</span>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
