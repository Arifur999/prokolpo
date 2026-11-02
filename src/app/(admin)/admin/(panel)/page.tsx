import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/modules/Admin/AdminPageHeader";
import { AuditFeed } from "@/components/modules/Admin/AuditFeed";
import { AttentionList } from "@/components/modules/Admin/dashboard/AttentionList";
import { KindBreakdown } from "@/components/modules/Admin/dashboard/KindBreakdown";
import { RecentSignups } from "@/components/modules/Admin/dashboard/RecentSignups";
import { SignupChart } from "@/components/modules/Admin/dashboard/SignupChart";
import { StatCards } from "@/components/modules/Admin/dashboard/StatCards";
import { Icon } from "@/components/shared/icon/Icon";
import { getAdminOverview } from "@/services/admin.services";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Admin.dashboard"))("title") };
}

// Board AdminDashboard.
export default async function AdminDashboardPage() {
  const [t, admin, overview] = await Promise.all([getTranslations("Admin.dashboard"), getTranslations("Admin"), getAdminOverview()]);
  const o = overview.data;
  const now = new Date().toISOString();

  return (
    <>
      <AdminPageHeader
        dated
        title={t("title")}
        subtitle={t("sub")}
        actions={
          <span className="flex items-center gap-2 rounded-[10px] border border-line-2 bg-white px-3.5 py-2.25 text-[13px] text-ink-2">
            <Icon name="shieldCheck" size={16} strokeWidth={2} />
            {admin("secure")}
          </span>
        }
      />
      <StatCards o={o} />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <SignupChart weeks={o.weeks} months={o.months} />
          <KindBreakdown projects={o.projects} users={o.users} />
          <RecentSignups recent={o.recent} now={now} />
        </div>
        <div className="flex flex-col gap-6">
          <AttentionList attention={o.attention} now={now} />
          <AuditFeed lines={o.audit} now={now} />
        </div>
      </div>
    </>
  );
}
