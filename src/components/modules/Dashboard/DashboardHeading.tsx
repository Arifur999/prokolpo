import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES } from "@/lib/routes";

// "শুভ সকাল, আব্দুল করিম / আমার প্রজেক্ট" with the new-project button.
export function DashboardHeading({ greeting }: { greeting: string }) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] text-ink-2">{greeting}</span>
        <h1 className="m-0 text-[30px] leading-[1.3] font-semibold">{t("title")}</h1>
      </div>
      <Link
        href={ROUTES.newProject}
        className="box-border flex h-12 items-center gap-2 rounded-xl bg-brand pr-5 pl-4 text-base font-semibold text-white no-underline hover:text-white"
      >
        <Icon name="plus" size={20} strokeWidth={2.2} />
        {t("newProject")}
      </Link>
    </div>
  );
}
