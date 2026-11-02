"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SUPPORT_TOPICS, type SupportTopic } from "@/types/support.types";

export function TopicPicker({ value, onChange }: { value: SupportTopic; onChange: (topic: SupportTopic) => void }) {
  const t = useTranslations("Support");

  return (
    <div role="radiogroup" aria-labelledby="su-topic" className="flex flex-col gap-2">
      <span id="su-topic" className="text-[15px] font-semibold">
        {t("topic")}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {SUPPORT_TOPICS.map((topic) => {
          const isChosen = topic === value;
          return (
            <label
              key={topic}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm",
                isChosen ? "border-[1.5px] border-brand bg-brand-wash font-semibold" : "border border-line bg-white font-medium",
              )}
            >
              <input type="radio" name="su-topic" checked={isChosen} onChange={() => onChange(topic)} className="m-0 size-4.5 shrink-0 accent-brand" />
              {t(`topics.${topic}`)}
            </label>
          );
        })}
      </div>
    </div>
  );
}
