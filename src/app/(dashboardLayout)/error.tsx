"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// A page inside the dashboard threw. The shell stays up; only the content is replaced.
// Next 16.3+ passes `retry` (re-renders and re-fetches), not `reset`. Check the docs in
// node_modules/next/dist/docs/ if the prop name differs in your version.
// Do not console.error the error here; the server already logged it under `digest`.
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border bg-card py-14 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">This page hit an unexpected error. Try again, or go somewhere else from the sidebar.</p>
      {error.digest && <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>}
      <Button onClick={() => retry()} className="mt-2">
        <RotateCcw aria-hidden="true" /> Try again
      </Button>
    </div>
  );
}
