"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

type Faq = { key: string; question: string; answer: string };

// One answer open at a time; the first starts open, as in the design.
export function FaqList({ items }: { items: Faq[] }) {
  const [openKey, setOpenKey] = useState<string | null>(items[0]?.key ?? null);

  return (
    <div className="flex flex-col border-t border-rule">
      {items.map((item) => {
        const isOpen = item.key === openKey;
        const answerId = `faq-${item.key}`;
        return (
          <div key={item.key} className="border-b border-rule">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent px-1 py-3 text-left text-[17px] font-semibold text-ink hover:text-brand"
              >
                {item.question}
                <Icon name="chevronDown" strokeWidth={2.2} className={cn("text-brand", isOpen && "rotate-180")} />
              </button>
            </h3>
            {isOpen && (
              <p id={answerId} className="m-0 pr-12 pb-4.5 pl-1 text-base leading-[1.7] text-ink-2">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
