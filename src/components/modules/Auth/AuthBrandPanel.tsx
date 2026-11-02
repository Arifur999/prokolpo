import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/shared/icon/Icon";
import type { IconName } from "@/components/shared/icon/iconPaths";
import { ROUTES } from "@/lib/routes";

const POINTS: { key: "dues" | "partners" | "sales"; icon: IconName }[] = [
  { key: "dues", icon: "receipt" },
  { key: "partners", icon: "users" },
  { key: "sales", icon: "key" },
];

// The green left half of every sign-in screen. Hidden on small screens, where the form needs the room.
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

      <div className="relative my-auto flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <p className="m-0 font-heading text-[40px] leading-[1.45] font-bold">{t("title")}</p>
          <p className="m-0 max-w-110 text-[17px] leading-[1.6] text-white/80">{t("lead")}</p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-5.5 p-0">
          {POINTS.map((point) => (
            <li key={point.key} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/16 text-gold-light">
                <Icon name={point.icon} size={22} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[17px] font-semibold">{t(`points.${point.key}.title`)}</span>
                <span className="text-[15px] text-white/75">{t(`points.${point.key}.body`)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative m-0 text-sm text-white/62">{t("audience")}</p>
    </section>
  );
}
