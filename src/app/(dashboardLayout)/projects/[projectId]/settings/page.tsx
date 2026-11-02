import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SettingsView } from "@/components/modules/Settings/SettingsView";
import { dhakaToday } from "@/lib/dhakaTime";
import { SETTINGS_TABS } from "@/lib/settingsTabs";
import { getSettings } from "@/services/settings.services";
import { loadProject } from "../loadProject";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("Settings"))("title") };
}

// Boards Settings, SettingsPhases, SettingsReceipt, SettingsSupport, SettingsSupportGrant and
// SettingsDelete: one page, the tab in ?tab=.
export default async function SettingsPage({ params, searchParams }: PageProps<"/projects/[projectId]/settings">) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const project = await loadProject(projectId);
  if (!project) notFound();

  const { data: settings } = await getSettings(projectId);
  const tab = SETTINGS_TABS.find((key) => key === query.tab) ?? "general";
  const now = new Date();

  return (
    <div className="flex grow flex-col gap-5 p-4 lg:px-10 lg:pt-7 lg:pb-10">
      <SettingsView
        key={JSON.stringify(settings.general)}
        projectId={projectId}
        settings={settings}
        tab={tab}
        now={now.toISOString()}
        today={dhakaToday(now)}
      />
    </div>
  );
}
