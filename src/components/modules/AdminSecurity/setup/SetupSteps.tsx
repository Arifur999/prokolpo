import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// The two-step progress at the top of setup (board AdminTwoFactorSetup).
export function SetupSteps({ at }: { at: 0 | 1 }) {
  const t = useTranslations("AdminSecurity.setup");
  const steps = [t("stepScan"), t("stepBackup")];
  return (
    <ol aria-label={t("steps")} className="m-0 flex list-none items-center gap-3 p-0">
      {steps.map((label, i) => {
        const done = i < at;
        const current = i === at;
        return (
          <li key={label} className={cn("flex items-center gap-3", i < steps.length - 1 ? "flex-1" : "flex-none")}>
            <span aria-current={current ? "step" : undefined} className="flex items-center gap-2.5 whitespace-nowrap">
              <span
                className={cn(
                  "box-border flex size-7.5 items-center justify-center rounded-full text-sm font-bold",
                  done ? "bg-success text-white" : current ? "bg-brand text-white" : "border-[1.5px] border-line bg-white text-ink-5",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={cn("text-[15px]", current ? "font-bold text-ink" : done ? "font-medium text-success" : "font-medium text-ink-5")}>{label}</span>
            </span>
            {i < steps.length - 1 && <span aria-hidden="true" className={cn("h-0.5 grow rounded-xs", done ? "bg-success" : "bg-line-2")} />}
          </li>
        );
      })}
    </ol>
  );
}
