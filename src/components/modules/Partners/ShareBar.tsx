import { useTranslations } from "next-intl";
import { partnerColor, percentText } from "@/lib/partnerMath";
import type { IPartner } from "@/types/partners.types";
import { ShareSwatch } from "./PartnerAvatar";

// "কার শেয়ার কত": one bar split by share, with a legend.
export function ShareBar({ partners }: { partners: IPartner[] }) {
  const t = useTranslations("Partners");
  return (
    <section
      aria-label={t("sharesTitle")}
      className="flex flex-col gap-4 rounded-2xl border border-line-2 bg-white px-6 py-4.5 lg:flex-row lg:items-center lg:gap-8"
    >
      <h2 className="m-0 shrink-0 text-[15px] font-semibold">{t("sharesTitle")}</h2>
      <figure className="m-0 flex grow flex-col gap-2.5">
        <div className="flex h-4 gap-0.5 overflow-hidden rounded-md bg-line-3">
          {partners.map((p) => (
            <span
              key={p.id}
              title={`${p.name}: ${percentText(p.share)}`}
              className="h-full"
              style={{ width: `${p.share}%`, background: partnerColor(p.color) }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {partners.map((p) => (
            <span key={p.id} className="flex items-center gap-2 text-sm">
              <ShareSwatch color={p.color} />
              <span className="text-ink-2">{p.name}</span>
              <strong className="font-bold">{percentText(p.share)}</strong>
            </span>
          ))}
        </div>
      </figure>
      <p className="m-0 max-w-65 text-[13px] leading-[1.55] text-ink-3">{t("sharesNote")}</p>
    </section>
  );
}
