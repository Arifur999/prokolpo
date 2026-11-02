import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

type FieldMessageProps = {
  id: string;
  tone: "error" | "hint" | "success";
  children: React.ReactNode;
  className?: string;
};

// The line under an input: red with an alert icon, green with a tick, or a plain grey hint.
export function FieldMessage({ id, tone, children, className }: FieldMessageProps) {
  if (tone === "hint") {
    return (
      <p id={id} className={cn("m-0 text-[13px] text-ink-3", className)}>
        {children}
      </p>
    );
  }
  const isError = tone === "error";
  return (
    <p id={id} className={cn("m-0 flex gap-1.5 text-sm", isError ? "items-start text-danger" : "items-center text-success", className)}>
      <Icon name={isError ? "alertCircle" : "check"} size={16} strokeWidth={isError ? 2 : 2.4} className={cn(isError && "mt-[3px]")} />
      {children}
    </p>
  );
}
