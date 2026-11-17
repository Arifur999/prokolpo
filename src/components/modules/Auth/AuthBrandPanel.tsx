import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

// The sample dashboard the panel shows: three projects with how far each has spent.
const SAMPLE: { key: "r1" | "r2" | "r3"; icon: IconName; percent: number }[] = [
  { key: "r1", icon: "apartment", percent: 62 },
  { key: "r2", icon: "shop", percent: 38 },
  { key: "r3", icon: "home", percent: 91 },
];
const TOTALS = ["budget", "spent", "deposited"] as const;
const CHIPS = ["managers", "roles", "reports"] as const;

// The green left half of every sign-in screen (design v2): many projects on one dashboard.
// Hidden on small screens, where the form needs the room.
export async function AuthBrandPanel() {
  const t = await getTranslations("Auth.brand");
  const common = await getTranslations("Common");

  return (
    <section aria-label={t("aboutLabel")} className="relative hidden w-150 shrink-0 flex-col overflow-hidden bg-brand px-14 py-12 text-white lg:flex">
      <div aria-hidden="true" className="absolute -right-50 -bottom-60 size-140 rounded-full border border-white/8" />
      <div aria-hidden="true" className="absolute -right-27.5 -bottom-37.5 size-95 rounded-full border border-white/8" />
      <div aria-hidden="true" className="absolute -right-7.5 -bottom-17.5 size-55 rounded-full bg-gold/10" />

      <Link href={ROUTES.home} aria-label={t("homeLabel")} className="relative flex items-center gap-3 self-start text-white no-underline">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-[13px] bg-gold font-heading text-2xl leading-none font-bold text-brand"
        >
          {common("logoMark")}
        </span>
        <span className="font-heading text-2xl font-bold">{common("appName")}</span>
      </Link>

      <div className="relative my-auto flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <p className="m-0 font-heading text-4xl leading-[1.4] font-bold">{t("title")}</p>
          <p className="m-0 max-w-115 text-base leading-[1.6] text-white/80">{t("lead")}</p>
        </div>

        <div aria-hidden="true" className="flex flex-col gap-2.5 rounded-[18px] border border-white/12 bg-white/6 p-4.5 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-3 px-0.5 pb-1">
            <span className="text-[15px] font-semibold">{t("demo.title")}</span>
            <span className="flex h-6 items-center rounded-full bg-mint-strong/18 px-2.5 text-xs font-semibold text-mint">{t("demo.active")}</span>
          </div>
          {SAMPLE.map((row) => (
            <div key={row.key} className="flex flex-col gap-2 rounded-xl bg-white/6 px-3.5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/16 text-gold-light">
                  <Icon name={row.icon} size={18} strokeWidth={1.8} />
                </span>
                <span className="flex min-w-0 grow flex-col">
                  <span className="text-[15px] font-semibold">{t(`demo.${row.key}.name`)}</span>
                  <span className="text-[13px] text-white/70">{t(`demo.${row.key}.sub`)}</span>
                </span>
                <span className="text-[15px] font-semibold">{row.percent}%</span>
              </div>
              <div className="h-1.25 overflow-hidden rounded-full bg-white/12">
                <div className={cn("h-full rounded-full", row.percent >= 90 ? "bg-gold-light" : "bg-mint-strong")} style={{ width: `${row.percent}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-1 grid grid-cols-3 gap-3 border-t border-white/12 px-1 pt-3 pb-0.5">
            {TOTALS.map((key) => (
              <span key={key} className="flex flex-col gap-0.5">
                <span className="text-xs text-white/62">{t(`demo.totals.${key}.label`)}</span>
                <span className="text-base font-semibold">{t(`demo.totals.${key}.value`)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CHIPS.map((key) => (
            <span key={key} className="flex h-8 items-center gap-1.5 rounded-full border border-white/18 px-3 text-[13px] text-white/85">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-light" />
              {t(`chips.${key}`)}
            </span>
          ))}
        </div>
      </div>

      <p className="relative m-0 text-sm text-white/62">{t("audience")}</p>
    </section>
  );
}
