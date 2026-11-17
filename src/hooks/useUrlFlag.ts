"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// A dialog that opens from the address (?transfer=1, ?invite=1 …), so a sidebar item or a
// link from another page can land on it, and closing it tidies the address again.
export function useUrlFlag(name: string): [boolean, (open: boolean) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const open = params.get(name) === "1";
  const setOpen = (next: boolean) => {
    const query = new URLSearchParams(params);
    if (next) query.set(name, "1");
    else query.delete(name);
    const rest = query.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
  };
  return [open, setOpen];
}
