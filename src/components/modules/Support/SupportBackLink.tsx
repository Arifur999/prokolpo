import Link from "next/link";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/shared/icon/Icon";
import { ROUTES } from "@/lib/routes";
import type { SupportSource } from "@/types/support.types";

// Signed-in people return to the dashboard; everyone else to login.
export const supportBackTarget = (source: SupportSource) =>
  source === "app" ? { href: ROUTES.dashboard, labelKey: "backToDashboard" as const } : { href: ROUTES.login, labelKey: "backToLogin" as const };

export function SupportBackLink({ source }: { source: SupportSource }) {
  const t = useTranslations("Support");
  const back = supportBackTarget(source);

  return (
    <Link href={back.href} className="flex items-center gap-1.5 self-start text-sm font-semibold no-underline">
      <Icon name="chevronLeft" size={16} strokeWidth={2} />
      {t(back.labelKey)}
    </Link>
  );
}
