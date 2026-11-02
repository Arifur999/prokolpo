import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { bodyFont, displayFont } from "@/lib/fonts";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "প্রকল্প — প্রজেক্টের হিসাব খাতা", template: "%s | প্রকল্প" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions inject attributes onto <body>. */}
      <body className="flex min-h-full flex-col bg-background" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-xl focus:bg-background focus:p-4 focus:text-foreground focus:shadow-lg"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
