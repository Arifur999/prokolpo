"use client";

import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

// Catches what the dashboard's error.tsx cannot: a failure in the dashboard layout itself,
// typically the API being unreachable while it loads the current user.
export default function RootError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <ServerCrash className="size-10 text-destructive" aria-hidden="true" />
      <h1 className="text-lg font-semibold text-foreground">We couldn&apos;t load the app</h1>
      <p className="max-w-md text-sm text-muted-foreground">The server may be temporarily unavailable. Try again in a moment.</p>
      <Button onClick={() => retry()} className="mt-2">
        Try again
      </Button>
    </main>
  );
}
