import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The small rounded tag used for phases and feature lists across the landing page.
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("rounded-full bg-surface-4 px-[9px] py-0.5 text-xs font-semibold text-ink-2", className)}>{children}</span>;
}
