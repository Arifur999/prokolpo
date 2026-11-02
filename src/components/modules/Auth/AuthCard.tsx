import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  subtitle: string;
  // Login is 460px wide, registration 480px.
  width?: "md" | "lg";
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, width = "md", footer, children }: AuthCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-7 rounded-3xl border border-line-2 bg-white p-6 shadow-card sm:p-10",
        width === "md" ? "max-w-115" : "max-w-120 gap-6",
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-2xl leading-[1.4] font-semibold">{title}</h1>
        <p className="m-0 text-[15px] text-ink-2">{subtitle}</p>
      </div>
      {children}
      {footer && (
        <>
          <div className="h-px bg-canvas-deep" />
          <p className="m-0 text-center text-[15px] text-ink-2">{footer}</p>
        </>
      )}
    </div>
  );
}
