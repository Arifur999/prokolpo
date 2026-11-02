import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import QRCode from "qrcode";
import { logoutAction } from "@/app/_actions/authActions";
import { GateShell } from "@/components/modules/AdminSecurity/GateShell";
import { SetupFlow } from "@/components/modules/AdminSecurity/setup/SetupFlow";
import { adminNext } from "@/lib/adminNext";
import { beginStaffSetup, getStaffStatus } from "@/services/staff.services";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations("AdminSecurity"))("setup.title") };
}

// Boards AdminTwoFactorSetup and AdminTwoFactorBackup: a new staff member's first visit.
export default async function AdminSetupPage({ searchParams }: PageProps<"/admin/setup">) {
  const query = await searchParams;
  const status = (await getStaffStatus()).data;
  const t = await getTranslations("AdminSecurity");
  // Once it is on there is nothing to scan; the flow still shows the backup codes it just got
  // (finishing setup sets the session cookie, which renders this page again).
  const setup = status.enabled ? null : (await beginStaffSetup()).data;
  // Drawn on the server: the secret never reaches a browser script, only the picture.
  const qrSvg = setup ? await QRCode.toString(setup.uri, { type: "svg", margin: 0, color: { dark: "#16211d", light: "#ffffff" } }) : "";
  const initials = status.name
    .split(/\s+/)
    .map((part) => Array.from(part)[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <GateShell
      right={
        <span className="box-border flex h-11 items-center gap-2.5 rounded-full bg-white/8 pr-1.5 pl-2 text-white">
          <span aria-hidden="true" className="flex size-7.5 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink">
            {initials}
          </span>
          <span className="text-sm font-semibold">{status.name}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-8 cursor-pointer items-center rounded-full border border-white/25 bg-transparent px-3 text-[13px] font-semibold text-white"
            >
              {t("logout")}
            </button>
          </form>
        </span>
      }
      footer={t("setup.footer")}
    >
      <SetupFlow status={status} qrSvg={qrSvg} setupKey={setup?.key ?? ""} next={adminNext(query.next)} />
    </GateShell>
  );
}
