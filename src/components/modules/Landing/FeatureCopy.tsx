import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { CheckList } from "./CheckList";

type FeatureCopyProps = {
  icon: IconName;
  title: string;
  body: string;
  points: string[];
};

export function FeatureCopy({ icon, title, body, points }: FeatureCopyProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-gold-tint text-gold-ink">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="m-0 font-heading text-[22px] leading-[1.4] font-bold md:text-[26px]">{title}</h3>
      <p className="m-0 text-base leading-[1.7] text-ink-2">{body}</p>
      <CheckList items={points} />
    </div>
  );
}
