"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ApiResult } from "@/types/api.types";

// Runs a settings action: a toast either way and the page re-read on success. Returns the
// result so a form can show its field errors.
export function useSettingsSave() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const run = <T>(action: () => Promise<ApiResult<T>>, done: string, after?: (result: ApiResult<T>) => void) =>
    startTransition(async () => {
      const result = await action();
      after?.(result);
      if (!result.success) return void toast.error(result.message);
      toast.success(done);
      router.refresh();
    });
  return { run, isPending };
}
