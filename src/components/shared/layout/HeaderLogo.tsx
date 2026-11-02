import Link from "next/link";
import { getTranslations } from "next-intl/server";

type HeaderLogoProps = {
  href: string;
  label: string;
};

// The mark and wordmark at the left of the white top bars.
export async function HeaderLogo({ href, label }: HeaderLogoProps) {
  const common = await getTranslations("Common");

  return (
    <Link href={href} aria-label={label} className="flex items-center gap-2.5 no-underline">
      <span
        aria-hidden="true"
        className="flex size-9 items-center justify-center rounded-[11px] bg-gold font-heading text-xl leading-none font-bold text-brand"
      >
        {common("logoMark")}
      </span>
      <span className="font-heading text-[21px] font-bold text-brand">{common("appName")}</span>
    </Link>
  );
}
