import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ProfileCard } from "./ProfileCard";

// A manager's login the project owner opened: the owner sets its password from the project's
// members page, so the profile says so instead of showing the change form.
export function ManagedPasswordCard() {
  const t = useTranslations("Profile.password");

  return (
    <ProfileCard id="pf-pw" title={t("title")}>
      <p className="m-0 flex items-start gap-2.5 px-5.5 py-5 text-[15px] leading-[1.55] text-ink-2">
        <Icon name="lock" size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-gold-ink" />
        {t("managed")}
      </p>
    </ProfileCard>
  );
}
