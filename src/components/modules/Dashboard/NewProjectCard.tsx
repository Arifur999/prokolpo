import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES } from "@/lib/routes";

// The dashed "start a new project" tile at the end of the grid.
export function NewProjectCard() {
  const t = useTranslations("Dashboard.newCard");

  return (
    <Link
      href={ROUTES.newProject}
      className="box-border flex h-full min-h-85 flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-line-strong p-6 text-center text-ink no-underline hover:border-brand hover:text-ink"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Icon name="plus" size={26} strokeWidth={2.2} />
      </span>
      <span className="text-[17px] font-semibold">{t("title")}</span>
      <span className="max-w-60 text-sm text-ink-3">{t("body")}</span>
    </Link>
  );
}
