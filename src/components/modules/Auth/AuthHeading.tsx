import type { ReactNode } from "react";

export function AuthHeading({ title, subtitle }: { title: string; subtitle: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="m-0 text-2xl leading-[1.4] font-semibold">{title}</h1>
      <p className="m-0 text-[15px] text-ink-2">{subtitle}</p>
    </div>
  );
}
