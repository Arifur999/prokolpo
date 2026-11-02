import { useTranslations } from "next-intl";
import { passwordStrength } from "@/lib/passwordStrength";
import { cn } from "@/lib/utils";

const SEGMENT = ["bg-line-2", "bg-danger-strong", "bg-gold-strong", "bg-brand-mid"] as const;
const LABEL_TONE = ["text-ink-3", "text-danger", "text-gold-ink", "text-success"] as const;
const LABEL_KEY = [null, "weak", "medium", "strong"] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const t = useTranslations("Auth.register.strength");
  const strength = passwordStrength(password);
  if (strength === 0) return null;
  const labelKey = LABEL_KEY[strength];

  return (
    <div className="flex items-center gap-2.5">
      <div aria-hidden="true" className="grid grow grid-cols-3 gap-1">
        {[1, 2, 3].map((segment) => (
          <span key={segment} className={cn("h-1.5 rounded-full", strength >= segment ? SEGMENT[strength] : SEGMENT[0])} />
        ))}
      </div>
      <span aria-live="polite" className={cn("min-w-18 text-right text-[13px] font-semibold", LABEL_TONE[strength])}>
        {labelKey && t(labelKey)}
      </span>
    </div>
  );
}
