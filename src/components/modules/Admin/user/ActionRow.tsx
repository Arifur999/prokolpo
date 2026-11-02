import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { cn } from "@/lib/utils";

type ActionRowProps = {
  icon: IconName;
  // brand: a filled green well; danger and success colour the whole row.
  tone?: "plain" | "brand" | "danger" | "success";
  title: string;
  sub: string;
  subWarn?: boolean;
  disabled?: boolean;
  last?: boolean;
  onClick: () => void;
};

const WELL = { plain: "bg-surface-4 text-ink-2", brand: "bg-brand text-white", danger: "bg-danger-tint text-danger", success: "bg-brand-tint text-success" };
const INK = { plain: "text-ink", brand: "text-ink", danger: "text-danger", success: "text-success" };

// One action in an account's side panels (board AdminUserDetail): an icon, what it does, and
// a line on when it applies; unavailable ones fade.
export function ActionRow({ icon, tone = "plain", title, sub, subWarn, disabled, last, onClick }: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 border-x-0 border-t-0 bg-white px-4.5 py-3 text-left hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-white",
        last ? "border-b-0" : "border-b border-line-3",
        INK[tone],
        !disabled && "cursor-pointer",
      )}
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px]", WELL[tone])}>
        <Icon name={icon} size={18} strokeWidth={2} />
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className={cn("text-[13px]", subWarn ? "text-gold-ink" : "text-ink-3")}>{sub}</span>
      </span>
    </button>
  );
}
