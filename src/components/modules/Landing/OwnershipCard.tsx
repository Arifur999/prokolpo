import { cn } from "@/lib/utils";
import { Pill } from "./Pill";

type OwnershipCardProps = {
  title: string;
  badge: string;
  body: string;
  tags: string[];
  // Joint projects get the green wash; personal ones stay neutral.
  isJoint?: boolean;
};

export function OwnershipCard({ title, badge, body, tags, isJoint = false }: OwnershipCardProps) {
  return (
    <div className={cn("flex flex-col gap-2.5 rounded-2xl border px-6 py-5", isJoint ? "border-success-line bg-brand-wash" : "border-line-2 bg-surface-2")}>
      <span className="flex items-center justify-between gap-3">
        <strong className="text-[17px] font-bold">{title}</strong>
        <span
          className={cn(
            "rounded-full border bg-white px-2.5 py-px text-[13px] font-semibold",
            isJoint ? "border-success-line text-brand" : "border-line-2 text-ink-2",
          )}
        >
          {badge}
        </span>
      </span>
      <span className="text-[15px] leading-[1.6] text-ink-2">{body}</span>
      <span className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Pill key={tag} className={cn("bg-white", isJoint && "text-brand")}>
            {tag}
          </Pill>
        ))}
      </span>
    </div>
  );
}
