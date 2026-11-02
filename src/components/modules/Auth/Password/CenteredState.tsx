import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-brand-tint text-brand",
  success: "bg-brand-tint text-success",
  danger: "bg-danger-tint text-danger",
} as const;

type CenteredStateProps = {
  icon: IconName;
  tone: keyof typeof TONES;
  title: string;
  children: ReactNode;
};

// The big round icon, title and paragraph of "check your email", "password changed" and "link expired".
export function CenteredState({ icon, tone, title, children }: CenteredStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className={cn("flex size-16 items-center justify-center rounded-full", TONES[tone])}>
        <Icon name={icon} size={30} strokeWidth={2} />
      </span>
      <h1 className="m-0 text-2xl leading-[1.4] font-semibold">{title}</h1>
      <p className="m-0 text-[15px] leading-[1.6] text-ink-2">{children}</p>
    </div>
  );
}

// The grey explanatory box under those states.
export function NoteBox({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("m-0 rounded-lg bg-surface-2 px-3 py-2.5 text-[13px] leading-[1.55] text-ink-2", className)}>{children}</p>;
}
