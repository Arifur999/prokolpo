import { redirect } from "next/navigation";
import { SESSION_EXPIRED_LOGIN_ROUTE } from "@/lib/authUtils";
import { getUserInfo } from "@/services/auth.services";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  // proxy.ts already bounced anyone without a session. This catches a token the API itself
  // no longer accepts. getUserInfo is cache()d, so sidebar and page reuse this round trip.
  // It throws on an outage (error.tsx shows), and returns null only on 401/403.
  const user = await getUserInfo();
  if (!user) redirect(SESSION_EXPIRED_LOGIN_ROUTE);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* <DashboardSidebar role={user.role} /> */}
      {/* min-w-0: a flex child holding a wide table must be allowed to shrink. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* <DashboardNavbar user={user} /> */}
        {/* id + tabIndex: focus target for the root layout's skip link. */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 outline-none md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
