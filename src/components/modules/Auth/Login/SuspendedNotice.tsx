import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES, SUPPORT_WHATSAPP } from "@/lib/routes";

export function SuspendedNotice() {
  const t = useTranslations("Auth.suspended");

  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-danger-line bg-danger-tint px-4 py-3.5 text-danger-ink">
      <Icon name="ban" size={22} strokeWidth={2} className="mt-px text-danger-strong" />
      <div className="flex flex-col gap-2">
        <strong className="text-[15px] leading-normal">{t("title")}</strong>
        <span className="text-sm leading-[1.6] text-danger-ink-2">{t("body")}</span>
        <span className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
          <Link
            href={ROUTES.support}
            className="flex h-9.5 items-center rounded-lg bg-danger-strong px-3.5 text-sm font-semibold text-white no-underline hover:text-white"
          >
            {t("contact")}
          </Link>
          <span className="text-sm text-danger-ink-2">
            {t("whatsapp")} <strong>{SUPPORT_WHATSAPP}</strong>
          </span>
        </span>
      </div>
    </div>
  );
}
