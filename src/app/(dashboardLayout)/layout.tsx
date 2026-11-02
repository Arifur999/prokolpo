import { redirect } from "next/navigation";
import { SESSION_EXPIRED_LOGIN_ROUTE } from "@/lib/authUtils";
import { getUserInfo } from "@/services/auth.services";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  // proxy.ts already bounced anyone without a session. This catches a token the API itself
  // no longer accepts. getUserInfo is cache()d, so the header and page reuse this round trip.
  // It throws on an outage (error.tsx shows), and returns null only on 401/403.
  const user = await getUserInfo();
  if (!user) redirect(SESSION_EXPIRED_LOGIN_ROUTE);

  return <div className="flex min-h-screen flex-col bg-canvas text-ink">{children}</div>;
}
