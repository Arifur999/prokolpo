import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type AppCodeFieldProps = { id: string; value: string; onChange: (value: string) => void; error?: string };

// "আপনার যাচাই কোড" — the staff member's own authenticator code before a sensitive action.
export function AppCodeField({ id, value, onChange, error }: AppCodeFieldProps) {
  const t = useTranslations("AdminUser.phone");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {t("code")} <span className="font-normal text-ink-3">{t("codeHint")}</span>
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="••• •••"
        value={value}
        aria-invalid={!!error}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "box-border h-11.5 w-45 rounded-[10px] bg-white px-3.5 text-xl font-bold tracking-[0.2em] text-ink outline-none focus:shadow-focus",
          error ? "border-[1.5px] border-danger-strong" : "border border-line focus:border-brand",
        )}
      />
      {error && <span className="text-[13px] text-danger">{error}</span>}
    </div>
  );
}

// The code as the API takes it: six Latin digits.
export const codeDigits = (value: string) => value.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/\D/g, "");
