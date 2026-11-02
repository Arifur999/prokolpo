import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/routes";
import type { SupportSource, SupportTopic } from "@/types/support.types";
import { Icon } from "@/components/shared/icon/Icon";
import { supportBackTarget } from "./SupportBackLink";

const formatPhone = (phone: string) => `${phone.slice(0, 5)}-${phone.slice(5)}`;

type SupportSentProps = {
  reference: string;
  phone: string;
  topic: SupportTopic;
  source: SupportSource;
};

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <p className="m-0 rounded-xl bg-surface-2 px-3.5 py-3 text-sm leading-[1.6] text-ink">{children}</p>
);

// "Request received", with what happens next for the request's kind (board Support, sent state).
export function SupportSent({ reference, phone, topic, source }: SupportSentProps) {
  const t = useTranslations("Support");
  const back = supportBackTarget(source);

  return (
    <div className="flex flex-col gap-4.5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand-tint text-success">
          <Icon name="check" size={30} strokeWidth={2} />
        </span>
        <h1 className="m-0 text-2xl leading-[1.4] font-semibold">{t("sentTitle")}</h1>
        <span className="rounded-full bg-surface-4 px-3 py-0.5 text-sm font-bold text-ink-2">{t("reference", { reference })}</span>
        <p className="m-0 text-[15px] leading-[1.65] text-ink-2">{t("sentBody", { phone: formatPhone(phone) })}</p>
      </div>
      {topic === "login" && <InfoBox>{t("sentLogin")}</InfoBox>}
      {source === "suspended" && <InfoBox>{t("sentSuspended")}</InfoBox>}
      {topic === "project" && (
        <InfoBox>
          {t("sentProjectBefore")} <strong>{t("sentProjectPlace")}</strong> {t("sentProjectAfter")}
        </InfoBox>
      )}
      <div className="flex gap-2.5">
        <Link
          href={back.href}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white no-underline hover:text-white"
        >
          {t(back.labelKey)}
        </Link>
        {source !== "app" && (
          <Link
            href={ROUTES.home}
            className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-[15px] font-semibold text-ink no-underline hover:text-ink"
          >
            {t("home")}
          </Link>
        )}
      </div>
    </div>
  );
}
