import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";

// Every project is in the restore list, none open (board DashboardRestore).
export function NoActiveProjects() {
  const t = useTranslations("Dashboard.empty");

  return (
    <section
      aria-labelledby="em-title"
      className="flex flex-col items-center gap-3 rounded-[20px] border border-line-2 bg-white px-6 py-9 text-center sm:px-12"
    >
      <span aria-hidden="true" className="flex size-18 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Icon name="folder" size={34} strokeWidth={1.6} />
      </span>
      <h2 id="em-title" className="m-0 mt-1 text-[22px] leading-[1.4] font-semibold">
        {t("noActiveTitle")}
      </h2>
      <p className="m-0 max-w-130 text-[15px] leading-[1.6] text-ink-2">{t("noActiveBody")}</p>
    </section>
  );
}
