import { PublicHeader } from "@/components/shared/layout/PublicHeader";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <PublicHeader />
      {children}
    </div>
  );
}
