import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GateShell } from "@/components/modules/AdminSecurity/GateShell";
import { VerifyCard } from "@/components/modules/AdminSecurity/VerifyCard";
import { Icon } from "@/components/shared/icon/Icon";
import { adminNext } from "@/lib/adminNext";
import { getStaffStatus } from "@/services/staff.services";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("AdminSecurity"))("verify.titleApp") };
}

// Board AdminTwoFactor: the second step before the admin panel opens.
export default async function AdminVerifyPage({ searchParams }: PageProps<"/admin/verify">) {
  const query = await searchParams;
  const status = (await getStaffStatus()).data;
  if (!status.enabled) redirect("/admin/setup");
  const t = await getTranslations("AdminSecurity");
  const initials = status.name
    .split(/\s+/)
    .map((part) => Array.from(part)[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <GateShell
      right={
        <Link
          href="/dashboard"
          className="box-border flex h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-[15px] font-semibold text-white no-underline hover:text-white"
        >
          <Icon name="arrowLeft" size={18} strokeWidth={2} />
          {t("backToApp")}
        </Link>
      }
      footer={
        <>
          <Icon name="lock" size={16} strokeWidth={2} />
          {t("verify.footer")}
        </>
      }
    >
      <section
        aria-labelledby="vf-title"
        className="box-border flex w-full max-w-125 flex-col gap-5 rounded-[20px] bg-white px-6 py-8 shadow-[0_24px_64px_rgb(0_0_0/0.35)] sm:px-9"
      >
        <VerifyCard status={status} initials={initials} idle={query.idle === "1"} next={adminNext(query.next)} />
        <p className="m-0 border-t border-line-3 pt-4 text-[13px] leading-[1.6] text-ink-3">{t("verify.lost")}</p>
      </section>
    </GateShell>
  );
}
