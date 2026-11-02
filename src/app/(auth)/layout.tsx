import { AuthBrandPanel } from "@/components/modules/Auth/AuthBrandPanel";
import { AuthLanguageSwitch } from "@/components/modules/Auth/AuthLanguageSwitch";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-screen bg-canvas text-ink">
      <AuthBrandPanel />
      <AuthLanguageSwitch />
      <main id="main-content" className="flex grow items-center justify-center px-4 pt-24 pb-12 sm:px-12 lg:py-12">
        {children}
      </main>
    </div>
  );
}
