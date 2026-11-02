import { useTranslations } from "next-intl";
import { passwordRulesMet, resetPasswordScore } from "@/lib/passwordStrength";
import { cn } from "@/lib/utils";

const barTone = (score: number) => (score <= 1 ? "bg-danger-strong" : score === 2 ? "bg-gold-strong" : "bg-brand-mid");

// The four-bar meter and the two rules under a new password (boards ForgotPassword, Profile).
// The rules turn red once the form was tried and they still fail.
export function PasswordMeter({ id, password, attempted }: { id: string; password: string; attempted: boolean }) {
  const t = useTranslations("Auth.reset");
  const score = resetPasswordScore(password);
  const met = passwordRulesMet(password);
  return (
    <>
      <div aria-hidden="true" className="flex gap-1">
        {[0, 1, 2, 3].map((bar) => (
          <span key={bar} className={cn("h-[5px] flex-1 rounded-full", password && bar < Math.max(1, score) ? barTone(score) : "bg-line-3")} />
        ))}
      </div>
      <ul id={id} className="m-0 flex list-none flex-wrap gap-x-3.5 gap-y-0.5 p-0">
        {(["length", "mix"] as const).map((rule) => (
          <li key={rule} className={cn("text-[13px]", met[rule] ? "text-success" : attempted ? "text-danger" : "text-ink-3")}>
            <span aria-hidden="true" className="font-bold">
              {met[rule] ? "✓" : "•"}
            </span>{" "}
            {t(`rules.${rule}`)}
          </li>
        ))}
      </ul>
    </>
  );
}
