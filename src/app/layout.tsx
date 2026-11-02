import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AppToaster } from "@/components/shared/AppToaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { bodyFont, displayFont } from "@/lib/fonts";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Common");
  const appName = t("appName");
  return { title: { default: `${appName} — ${t("appTagline")}`, template: `%s | ${appName}` } };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const t = await getTranslations("Common");

  return (
    <html lang={locale} className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions inject attributes onto <body>. */}
      <body className="flex min-h-full flex-col bg-background" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-xl focus:bg-background focus:p-4 focus:text-foreground focus:shadow-lg"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <AppToaster />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
