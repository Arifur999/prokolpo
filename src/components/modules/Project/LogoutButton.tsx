"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/_actions/authActions";
import { Icon } from "@/components/shared/icon/Icon";

export function LogoutButton({ label }: { label: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction())}
      className="flex h-11 grow cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/18 bg-transparent text-[15px] font-medium text-white disabled:cursor-wait"
    >
      <Icon name="logout" size={18} />
      {label}
    </button>
  );
}
