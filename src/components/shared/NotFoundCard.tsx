import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

// The 404 body, pointing back to the area the reader came from.
export async function NotFoundCard({ href, label }: { href: string; label: "home" | "admin" }) {
  const t = await getTranslations("NotFound");
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <p className="text-5xl font-bold text-foreground tabular-nums">404</p>
      <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
      <Button asChild className="mt-2">
        <Link href={href}>{t(label)}</Link>
      </Button>
    </main>
  );
}
