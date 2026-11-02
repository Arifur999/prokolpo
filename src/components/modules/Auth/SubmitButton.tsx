import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  isSubmitting: boolean;
  // Nothing to submit yet (no way chosen): the design's pale green, not clickable.
  disabled?: boolean;
  label: string;
  submittingLabel: string;
  className?: string;
};

// The full-width 52px primary button of the sign-in screens, with the design's busy state.
export function SubmitButton({ isSubmitting, disabled = false, label, submittingLabel, className }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      aria-busy={isSubmitting}
      className={cn(
        "flex h-13 w-full items-center justify-center gap-2.5 rounded-xl border-none text-base font-semibold text-white",
        isSubmitting ? "cursor-progress bg-brand-mid" : disabled ? "cursor-not-allowed bg-brand-soft" : "cursor-pointer bg-brand",
        className,
      )}
    >
      {isSubmitting && <Icon name="spinner" size={18} strokeWidth={2.4} className="animate-spin" />}
      {isSubmitting ? submittingLabel : label}
    </button>
  );
}
