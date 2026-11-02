import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MaintenanceRetry } from "@/components/modules/Maintenance/MaintenanceRetry";
import { Icon } from "@/components/shared/icon/Icon";
import { formatHour } from "@/lib/dhakaTime";
import { ROUTES, SUPPORT_WHATSAPP } from "@/lib/routes";
import { getPlatformStatus } from "@/services/status.services";

export const metadata: Metadata = { title: "কাজ চলছে · Maintenance" };

// Board Maintenance: Bangla and English together, since nobody can switch language here.
export default async function MaintenancePage() {
  const status = await getPlatformStatus({ fresh: true });
  if (status && !status.maintenance.enabled) redirect(ROUTES.home);

  const bn = await getTranslations({ locale: "bn", namespace: "Maintenance" });
  const en = await getTranslations({ locale: "en", namespace: "Maintenance" });
  const common = await getTranslations({ locale: "bn", namespace: "Common" });
  const until = status?.maintenance.until ? new Date(status.maintenance.until) : null;
  const strong = (chunks: React.ReactNode) => <strong className="font-bold">{chunks}</strong>;
  const strongEn = (chunks: React.ReactNode) => <strong className="font-semibold text-ink-2">{chunks}</strong>;

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center gap-5.5 overflow-hidden px-4 py-24 text-ink bg-maintenance"
    >
      <Link href={ROUTES.home} aria-label={bn("homeLabel")} className="absolute top-7 left-10 flex items-center gap-2.5 no-underline">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-xl bg-gold font-heading text-[22px] leading-none font-bold text-brand"
        >
          {common("logoMark")}
        </span>
        <span className="font-heading text-[22px] font-bold text-brand">{common("appName")}</span>
      </Link>

      <section
        aria-labelledby="mt-title"
        className="flex w-full max-w-170 flex-col items-center gap-4.5 rounded-4xl border border-line-2 bg-white px-6 pt-11 pb-9 text-center shadow-showcase sm:px-12"
      >
        <span aria-hidden="true" className="flex size-21 items-center justify-center rounded-full bg-gold-tint text-gold-ink">
          <Icon name="wrench" size={40} strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 id="mt-title" className="m-0 text-[30px] leading-[1.35] font-semibold">
            {bn("title")}
          </h1>
          <p lang="en" className="m-0 text-[17px] text-ink-3">
            {en("title")}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[17px] leading-[1.6]">{until ? bn.rich("back", { time: formatHour(until, "bn"), strong }) : bn("backSoon")}</p>
          <p lang="en" className="m-0 text-[15px] leading-[1.6] text-ink-3">
            {until ? en.rich("back", { time: formatHour(until, "en"), strong: strongEn }) : en("backSoon")}
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch rounded-[14px] border border-success-line bg-brand-wash px-4 py-3 text-left">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-success">
            <Icon name="shieldCheck" size={18} strokeWidth={2} />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold text-brand">{bn("safe")}</span>
            <span lang="en" className="text-[13px] text-ink-2">
              {en("safe")}
            </span>
          </span>
        </div>
        <MaintenanceRetry label={{ bn: bn("retry"), en: en("retry") }} checked={{ bn: bn.raw("checked"), en: en.raw("checked") }} />
        <div className="h-px self-stretch bg-canvas-deep" />
        <p className="m-0 text-sm leading-[1.6] text-ink-2">
          {bn.rich("whatsapp", { phone: SUPPORT_WHATSAPP, strong: (chunks) => <strong className="text-ink">{chunks}</strong> })}
          <br />
          <span lang="en" className="text-ink-3">
            {en.rich("whatsapp", { phone: SUPPORT_WHATSAPP, strong: (chunks) => <>{chunks}</> })}
          </span>
        </p>
      </section>

      <Link href={ROUTES.login} className="flex items-center gap-1.5 text-sm text-ink-3 no-underline hover:text-ink-2">
        <Icon name="lock" size={16} />
        {bn("staff")}
      </Link>
    </main>
  );
}
