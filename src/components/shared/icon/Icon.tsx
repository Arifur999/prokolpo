import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import { ICON_PATHS, type IconName } from "./iconPaths";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  // Leave unset for decoration; set it when the icon is the only label (an icon-only button's svg).
  label?: string;
};

export function Icon({ name, size = 20, strokeWidth = 1.8, label, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...props}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
