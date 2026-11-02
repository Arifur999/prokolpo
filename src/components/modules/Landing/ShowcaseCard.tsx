import type { ReactNode } from "react";

type ShowcaseCardProps = {
  title: string;
  // Right side of the header: a total, a price, a paid-of-target figure.
  summary: ReactNode;
  footer?: string;
  children: ReactNode;
};

// A static product mock beside a feature. Purely illustrative, so it is hidden from screen readers;
// the feature copy next to it says the same thing in words.
export function ShowcaseCard({ title, summary, footer, children }: ShowcaseCardProps) {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden rounded-[18px] border border-line-2 bg-white shadow-showcase">
      <div className="flex items-center justify-between gap-3 border-b border-line-3 px-5 py-3.5">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] text-ink-3">{summary}</span>
      </div>
      {children}
      {footer && <div className="border-t border-line-3 bg-surface-3 px-5 py-[11px] text-[13px] text-ink-2">{footer}</div>}
    </div>
  );
}
