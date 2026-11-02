import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { formatWeekdayDate } from "@/lib/dhakaTime";

type AdminPageHeaderProps = { title: string; subtitle: string; actions?: ReactNode };

// The top of every admin page: the panel and today's date over the title, actions on the right.
export async function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  const [t, locale] = await Promise.all([getTranslations("Admin"), getLocale()]);
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-ink-2">
          {t("panel")} · {formatWeekdayDate(new Date(), locale as Locale)}
        </span>
        <h1 className="m-0 text-2xl leading-[1.3] font-semibold lg:text-[28px]">{title}</h1>
        <p className="m-0 text-[15px] text-ink-2">{subtitle}</p>
      </div>
      {actions}
    </header>
  );
}
