import { nameInitials } from "@/lib/memberLook";
import { partnerColor } from "@/lib/partnerMath";
import { cn } from "@/lib/utils";

const SIZES = { sm: "size-10 border-3 text-[13px]", md: "size-11 border-3 text-sm", lg: "size-15 border-4 text-[19px]" };

// A partner's initials in a ring of their colour.
export function PartnerAvatar({ name, color, size = "sm" }: { name: string; color: number; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden="true"
      style={{ borderColor: partnerColor(color) }}
      className={cn("flex shrink-0 items-center justify-center rounded-full border-solid bg-white font-bold text-ink", SIZES[size])}
    >
      {nameInitials(name)}
    </span>
  );
}

// The small square swatch beside a share.
export function ShareSwatch({ color }: { color: number }) {
  return <span aria-hidden="true" style={{ background: partnerColor(color) }} className="size-2.5 shrink-0 rounded-[3px]" />;
}
