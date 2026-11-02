import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/modules/Admin/AdminSidebar";
import { SESSION_EXPIRED_LOGIN_ROUTE } from "@/lib/authUtils";
import { ADMIN_SESSION_COOKIE } from "@/lib/tokenUtils";
import { getAdminBadges } from "@/services/admin.services";
import { getUserInfo } from "@/services/auth.services";
import { getStaffStatus } from "@/services/staff.services";

// Every admin panel page: it opens only after the second step, and the session ends after 30
// idle minutes; then the staff member is asked for a code again.
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const user = await getUserInfo();
  if (!user) redirect(SESSION_EXPIRED_LOGIN_ROUTE);
  const status = (await getStaffStatus()).data;
  if (!status.enabled) redirect("/admin/setup");
  const hadSession = !!(await cookies()).get(ADMIN_SESSION_COOKIE);
  const badges = await getAdminBadges().catch((error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  });
  if (!badges) redirect(hadSession ? "/admin/verify?idle=1" : "/admin/verify");

  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      <AdminSidebar user={user} openSupport={badges.data.openSupport} />
      <main id="main-content" tabIndex={-1} className="box-border flex min-w-0 grow flex-col gap-6 p-4 outline-none lg:px-10 lg:pt-7 lg:pb-10">
        {children}
      </main>
    </div>
  );
}
