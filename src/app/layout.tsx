import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";

// globals.css (shadcn) reads --font-sans.
const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Prokolpo", template: "%s | Prokolpo" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
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
