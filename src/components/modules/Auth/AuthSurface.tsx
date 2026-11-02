import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthSurfaceProps = {
  // Login is 460px wide; registration and the password screens 480px.
  width?: "md" | "lg";
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

// The white card every sign-in screen sits in, with its divider and footer line.
export function AuthSurface({ width = "md", footer, className, children }: AuthSurfaceProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-7 rounded-3xl border border-line-2 bg-white p-6 shadow-card sm:p-10",
        width === "md" ? "max-w-115" : "max-w-120 gap-6",
        className,
      )}
    >
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
