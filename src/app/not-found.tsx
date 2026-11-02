import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <p className="text-5xl font-bold text-foreground tabular-nums">404</p>
      <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
      <Button asChild className="mt-2">
        <Link href="/dashboard">Go to the dashboard</Link>
      </Button>
    </main>
  );
}
