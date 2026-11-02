import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: ReactNode;
  note?: ReactNode;
  // A coloured dot before the title (বাকিতে amber, নগদে green).
  dot?: "gold" | "green" | "red";
  tone?: "default" | "danger";
  className?: string;
};

const DOT = { gold: "bg-gold-strong", green: "bg-brand-mid", red: "bg-danger-strong" };

// One summary card above a list: a small title, a 26px figure and a grey note.
export function StatCard({ title, value, note, dot, tone = "default", className }: StatCardProps) {
  return (
    <article
      className={cn("flex flex-col gap-1.5 rounded-2xl border bg-white px-5 py-4.5", tone === "danger" ? "border-danger-line" : "border-line-2", className)}
    >
      <h2 className="m-0 flex items-center gap-2 text-sm font-medium text-ink-2">
        {dot && <span aria-hidden="true" className={cn("size-2 rounded-full", DOT[dot])} />}
        {title}
      </h2>
      <p className="m-0 text-[22px] leading-[1.2] font-semibold lg:text-[26px]">{value}</p>
      {note && <p className={cn("m-0 text-[13px]", tone === "danger" ? "font-semibold text-danger" : "text-ink-3")}>{note}</p>}
    </article>
  );
}
