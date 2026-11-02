"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// Shows a success toast once when a page arrives with news (?welcome, ?created).
export function ToastOnMount({ message }: { message: string }) {
  useEffect(() => {
    toast.success(message, { id: message });
  }, [message]);
  return null;
}
