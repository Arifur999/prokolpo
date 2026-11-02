import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES } from "@/lib/routes";

// Registration is closed or invite-only. Checking an invited number arrives with project
// members; until then this explains the pause and points to support.
export function RegistrationClosedNotice() {
  const t = useTranslations("Auth.register");

  return (
    <div className="flex flex-col gap-4.5">
      <div role="status" className="flex gap-3 rounded-xl border border-gold-border bg-gold-tint px-4 py-3.5 text-gold-deep">
        <Icon name="info" size={22} strokeWidth={2} className="mt-px" />
        <div className="flex flex-col gap-1">
          <strong className="text-[15px] text-gold-darkest">{t("closedNoticeTitle")}</strong>
          <span className="text-sm leading-[1.6]">{t("closedNoticeBody")}</span>
        </div>
      </div>
      <p className="m-0 text-sm leading-[1.6] text-ink-2">
        {t("closedHelp")}{" "}
        <Link href={ROUTES.support} className="font-semibold">
          {t("closedHelpLink")}
        </Link>
        {t("closedHelpEnd")}
      </p>
    </div>
  );
}
