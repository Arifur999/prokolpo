import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const STEPS = ["phone", "choose", "password"] as const;
export type ResetStep = (typeof STEPS)[number];

// The three-segment progress bar above every password screen.
export function ResetSteps({ current }: { current: ResetStep }) {
  const t = useTranslations("Auth.forgot");
  const currentIndex = STEPS.indexOf(current);

  return (
    <ol aria-label={t("stepsLabel")} className="m-0 flex list-none items-center gap-2 p-0">
      {STEPS.map((step, index) => (
        <li key={step} aria-current={index === currentIndex ? "step" : undefined} className="flex flex-1 flex-col gap-1.5">
          <span className={cn("h-1 rounded-full", index <= currentIndex ? "bg-brand" : "bg-line-2")} />
          <span
            className={cn(
              "text-xs",
              index === currentIndex ? "font-bold text-ink" : "font-medium",
              index < currentIndex ? "text-brand" : index > currentIndex && "text-ink-5",
            )}
          >
            {t(`steps.${step}`)}
          </span>
        </li>
      ))}
    </ol>
  );
}
