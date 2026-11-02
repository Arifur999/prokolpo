import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { SUPPORT_WHATSAPP } from "@/lib/routes";

export function SupportFooter() {
  const t = useTranslations("Support");

  return (
    <>
      <div className="h-px bg-canvas-deep" />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-2">
        <span className="flex items-center gap-2">
          <Icon name="whatsapp" size={18} />
          {t("whatsapp")} <strong className="text-ink">{SUPPORT_WHATSAPP}</strong> {t("hours")}
        </span>
        <Link href="/#lp-faq" className="font-semibold no-underline">
          {t("faq")}
        </Link>
      </div>
    </>
  );
}
