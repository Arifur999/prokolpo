import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NewProjectForm } from "@/components/modules/NewProject/NewProjectForm";
import { newProjectDefaults } from "@/components/modules/NewProject/newProjectValues";
import { Icon } from "@/components/shared/icon/Icon";
import { dhakaToday } from "@/lib/dhakaTime";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("NewProject"))("title") };
}

// Board NewProject. ?ownership=PARTNERSHIP comes from the empty dashboard's "joint project" card.
export default async function NewProjectPage({ searchParams }: PageProps<"/projects/new">) {
  const t = await getTranslations("NewProject");
  const { ownership } = await searchParams;
  const defaults = newProjectDefaults(ownership === "PARTNERSHIP" ? "PARTNERSHIP" : "PERSONAL", dhakaToday());

  return (
    <div className="flex flex-col gap-6 pt-7">
      <div className="flex flex-col gap-2.5">
        <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-ink-2">
          <Link href={ROUTES.dashboard} className="text-ink-2 no-underline hover:text-ink">
            {t("breadcrumbHome")}
          </Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          <span aria-current="page" className="font-medium text-ink">
            {t("breadcrumbCurrent")}
          </span>
        </nav>
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 text-[30px] leading-[1.3] font-semibold">{t("title")}</h1>
          <p className="m-0 text-[15px] text-ink-2">{t("intro")}</p>
        </div>
      </div>
      <NewProjectForm defaults={defaults} />
    </div>
  );
}
