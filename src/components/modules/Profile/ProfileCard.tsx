import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProfileCardProps = {
  id: string;
  title: string;
  sub?: ReactNode;
  // Left of the title (the avatar) and right of it (a button).
  lead?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  // The side column's cards are a little tighter (board Profile).
  compact?: boolean;
  children: ReactNode;
};

// One white card of the profile page: a titled header, its body and an optional grey footer.
export function ProfileCard({ id, title, sub, lead, aside, footer, compact = false, children }: ProfileCardProps) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
      <div className={cn("flex flex-wrap items-center gap-4 border-b border-line-3", compact ? "px-5 py-4" : "px-5.5 py-4")}>
        {lead}
        <div className="flex min-w-0 grow flex-col">
          <h2 id={id} className={cn("m-0 font-semibold", compact ? "text-[17px]" : "text-lg")}>
            {title}
          </h2>
          {sub && <span className="text-[13px] text-ink-3">{sub}</span>}
        </div>
        {aside}
      </div>
      {children}
      {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-3 bg-surface-3 px-5.5 py-3.5">{footer}</div>}
    </section>
  );
}
