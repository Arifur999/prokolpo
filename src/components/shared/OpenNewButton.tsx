"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./icon/Icon";

// Opens a list page's add dialog through ?new=1, as links from other pages do too.
export function OpenNewButton({ label }: { label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      onClick={() => router.replace(`${pathname}?new=1`, { scroll: false })}
      className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border-none bg-brand pr-4.5 pl-3.5 text-[15px] font-semibold text-white"
    >
      <Icon name="plus" size={18} strokeWidth={2.2} />
      {label}
    </button>
  );
}
