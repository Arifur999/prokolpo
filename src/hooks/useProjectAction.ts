"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ApiResult } from "@/types/api.types";

// Runs a one-click project action (delete, restore), toasts the outcome and re-renders the page.
// Resolves true on success so the caller can close its dialog.
export function useProjectAction(action: (id: string) => Promise<ApiResult<unknown>>, successMessage: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (id: string) =>
    new Promise<boolean>((resolve) =>
      startTransition(async () => {
        const result = await action(id);
        if (!result.success) {
          toast.error(result.message);
          resolve(false);
          return;
        }
        toast.success(successMessage);
        router.refresh();
        resolve(true);
      }),
    );

  return { run, isPending };
}
