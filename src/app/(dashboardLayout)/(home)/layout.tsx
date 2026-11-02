import { redirect } from "next/navigation";
import { AppHeader } from "@/components/shared/layout/AppHeader";
import { SESSION_EXPIRED_LOGIN_ROUTE } from "@/lib/authUtils";
import { getUserInfo } from "@/services/auth.services";

// Pages outside a project: the white top bar over the page (boards Dashboard, NewProject).
export default async function HomeLayout({ children }: LayoutProps<"/">) {
  const user = await getUserInfo();
  if (!user) redirect(SESSION_EXPIRED_LOGIN_ROUTE);

  return (
    <>
      <AppHeader user={user} />
      <main id="main-content" tabIndex={-1} className="flex grow flex-col px-page pt-10 pb-12 outline-none">
        {children}
      </main>
    </>
  );
}
