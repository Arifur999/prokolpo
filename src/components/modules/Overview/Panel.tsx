import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

// A white overview card with a 17px title, an optional subtitle and a "see all" link.
export function Panel({ title, subtitle, link, aside, children, className }: PanelProps) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl border border-line-2 bg-white px-5 py-5 lg:px-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="m-0 text-[17px] leading-[1.4] font-semibold">{title}</h2>
          {subtitle && <p className="m-0 text-sm text-ink-2">{subtitle}</p>}
        </div>
        {aside}
        {link && (
          <Link href={link.href} className="flex min-h-8 shrink-0 items-center gap-1 text-sm font-semibold no-underline">
            {link.label}
            <Icon name="chevronRight" size={16} strokeWidth={2} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// The grey line a panel shows until its books have entries.
export function PanelEmpty({ children }: { children: ReactNode }) {
  return <p className="m-0 flex grow items-center justify-center rounded-xl bg-surface-2 px-4 py-8 text-center text-sm text-ink-3">{children}</p>;
}
