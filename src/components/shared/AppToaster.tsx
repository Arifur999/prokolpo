"use client";

import { Toaster } from "sonner";
import { Icon } from "./icon/Icon";

const well = "flex size-7 shrink-0 items-center justify-center rounded-full";

// Toasts as the design draws them: a white card at the top right, under the header.
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      offset={{ top: 84, right: 24 }}
      mobileOffset={{ top: 76, right: 16, left: 16 }}
      icons={{
        success: (
          <span className={`${well} bg-brand-tint text-success`}>
            <Icon name="check" size={16} strokeWidth={2.6} />
          </span>
        ),
        error: (
          <span className={`${well} bg-danger-tint text-danger`}>
            <Icon name="alertCircle" size={16} strokeWidth={2.2} />
          </span>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-xl border border-line-2 bg-white py-3.5 pr-4.5 pl-3.5 font-sans text-[15px] font-semibold text-ink shadow-pop",
          icon: "m-0 flex size-auto shrink-0",
          title: "leading-normal",
          description: "text-sm font-normal text-ink-3",
        },
      }}
    />
  );
}
