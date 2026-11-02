import type { Metadata } from "next";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { deviceLabel } from "@/components/modules/Admin/user/deviceLabel";
import { SuspendedBanner } from "@/components/modules/Admin/user/SuspendedBanner";
import { UserActions } from "@/components/modules/Admin/user/UserActions";
import { UserDevices } from "@/components/modules/Admin/user/UserDevices";
import { UserHeader } from "@/components/modules/Admin/user/UserHeader";
import { UserHistory } from "@/components/modules/Admin/user/UserHistory";
import { UserInfo } from "@/components/modules/Admin/user/UserInfo";
import { UserNotes } from "@/components/modules/Admin/user/UserNotes";
import { UserProjects } from "@/components/modules/Admin/user/UserProjects";
import { getAdminUser } from "@/services/admin.services";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("AdminUsers"))("title") };
}

// Boards AdminUserDetail, AdminUserReset and AdminUserSuspended.
export default async function AdminUserPage({ params }: PageProps<"/admin/users/[userId]">) {
  const { userId } = await params;
  const response = await getAdminUser(userId).catch((error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  });
  if (!response) notFound();
  const u = response.data;
  const t = await getTranslations("AdminUser");
  const translate = (key: string, values?: Record<string, string>) => t(key as Parameters<typeof t>[0], values);
  const now = new Date().toISOString();
  const first = u.projects[0];
  // What support asks on the phone before giving a reset code, with the answers they expect.
  const checks = [
    { label: t("reset.checkName"), answer: `${u.firstName} ${u.lastName}` },
    { label: t("reset.checkProject"), answer: first ? `${first.name} — ${t(`roles.${first.role}`)}` : t("reset.unknown") },
    { label: t("reset.checkMember"), answer: first?.others.length ? first.others.join(", ") : t("reset.unknown") },
    { label: t("reset.checkDevice"), answer: u.devices[0] ? deviceLabel(u.devices[0].userAgent, translate).short : t("reset.unknown") },
  ];

  return (
    <>
      <UserHeader u={u} now={now} />
      {u.status === "suspended" && <SuspendedBanner u={u} />}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <UserInfo u={u} />
          <UserProjects u={u} now={now} />
          <UserDevices u={u} now={now} />
          <UserHistory u={u} now={now} />
        </div>
        <div className="flex flex-col gap-5">
          <UserActions u={u} checks={checks} />
          <UserNotes u={u} now={now} />
        </div>
      </div>
    </>
  );
}
