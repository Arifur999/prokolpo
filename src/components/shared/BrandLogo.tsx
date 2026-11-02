import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  // Wordmark colour follows the surface: white on the green hero and footer, ink on light pages.
  className?: string;
};

export async function BrandLogo({ className }: BrandLogoProps) {
  const t = await getTranslations("Common");

  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold font-heading text-[22px] leading-none font-bold text-brand"
      >
        {t("logoMark")}
      </span>
      <span className="font-heading text-[22px] font-bold">{t("appName")}</span>
    </span>
  );
}
