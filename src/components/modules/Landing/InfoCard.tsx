import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { cn } from "@/lib/utils";

// lg: the project-kind cards; md: the smaller "and more" cards.
const SIZES = {
  lg: { tile: "size-11 rounded-[13px]", icon: 22, title: "text-[19px]" },
  md: { tile: "size-10 rounded-[11px]", icon: 20, title: "text-lg" },
} as const;

type InfoCardProps = {
  icon: IconName;
  title: string;
  body: string;
  size?: keyof typeof SIZES;
  children?: ReactNode;
};

export function InfoCard({ icon, title, body, size = "lg", children }: InfoCardProps) {
  const look = SIZES[size];

  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-line-2 bg-white p-5.5">
      <span className={cn("flex items-center justify-center bg-brand-tint text-brand", look.tile)}>
        <Icon name={icon} size={look.icon} />
      </span>
      <span className="flex flex-col gap-1">
        <h3 className={cn("m-0 font-bold", look.title)}>{title}</h3>
        <span className="text-[15px] leading-[1.6] text-ink-2">{body}</span>
      </span>
      {children && <span className="flex flex-wrap items-center gap-1.5">{children}</span>}
    </article>
  );
}
