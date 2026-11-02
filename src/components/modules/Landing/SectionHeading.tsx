import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
  leadClassName?: string;
};

export function SectionHeading({ id, eyebrow, title, lead, className, leadClassName }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <span className="flex items-center gap-2 text-sm font-bold text-brand">
        <span aria-hidden="true" className="h-[3px] w-5 rounded-[2px] bg-gold" />
        {eyebrow}
      </span>
      <h2 id={id} className="m-0 font-heading text-[28px] leading-[1.35] font-bold md:text-[34px]">
        {title}
      </h2>
      {lead && <p className={cn("m-0 text-[17px] leading-[1.6] text-ink-2", leadClassName)}>{lead}</p>}
    </div>
  );
}
