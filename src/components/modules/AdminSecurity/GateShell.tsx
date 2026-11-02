import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

type GateShellProps = { right: ReactNode; footer: ReactNode; children: ReactNode };

// The admin sign-in steps' page (boards AdminTwoFactor, AdminTwoFactorSetup): the logo with
// its "অ্যাডমিন" badge on a dark backdrop, the card in the middle, a note under it.
export async function GateShell({ right, footer, children }: GateShellProps) {
  const t = await getTranslations("AdminSecurity");
  const common = await getTranslations("Common");

  return (
    <div className="flex min-h-screen flex-col items-center text-ink bg-admin-gate">
      <header className="box-border flex w-full flex-wrap items-center justify-between gap-3 px-4 py-6 md:px-10">
        <span className="flex items-center gap-3 text-white">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-gold font-heading text-[22px] leading-none font-bold text-ink"
          >
            {common("logoMark")}
          </span>
          <span className="font-heading text-[21px] font-bold">{common("appName")}</span>
          <span className="rounded-full bg-gold px-2 text-xs leading-[1.6] font-bold text-ink">{t("badge")}</span>
        </span>
        <span className="flex items-center gap-3">
          <LanguageToggle
            label={t("otherLanguage")}
            className="box-border flex h-11 items-center gap-2 rounded-full border border-white/30 bg-transparent pr-4 pl-3.5 text-[15px] font-semibold text-white"
            iconClassName="text-gold-light"
          />
          {right}
        </span>
      </header>
      <main id="main-content" className="flex w-full grow flex-col items-center justify-center gap-4.5 px-4 pb-12">
        {children}
        <p className="m-0 flex items-center gap-2 text-center text-sm text-white/70">{footer}</p>
      </main>
    </div>
  );
}
