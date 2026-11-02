"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { logoutEverywhereAction, sendResetLinkAction } from "@/app/(admin)/admin/(panel)/users/[userId]/_action";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import type { IAdminUserDetail } from "@/types/admin.types";
import { ActionRow } from "./ActionRow";
import { deviceLabel } from "@/lib/deviceLabel";
import { PhoneDialog } from "./PhoneDialog";
import { ResetCodeDialog } from "./ResetCodeDialog";
import { SuspendDialog } from "./SuspendDialog";

type Open = "reset" | "logout" | "phone" | "suspend" | "unsuspend" | null;

// The account's two action panels (board AdminUserDetail): help that support can give, and
// the super admin's number change and suspension.
export function UserActions({ u, checks }: { u: IAdminUserDetail; checks: { label: string; answer: string }[] }) {
  const t = useTranslations("AdminUser");
  const router = useRouter();
  const [open, setOpen] = useState<Open>(null);
  const [isPending, startTransition] = useTransition();
  const translate = (key: string, values?: Record<string, string>) => t(key as Parameters<typeof t>[0], values);
  const active = u.status === "active";
  const devices = u.devices.length;
  const names = [...new Set(u.devices.map((d) => deviceLabel(d.userAgent, translate).short))].join(", ");

  const sendLink = () =>
    startTransition(async () => {
      const result = await sendResetLinkAction(u.id);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("linkSent", { email: u.email ?? "" }));
      router.refresh();
    });

  const logout = () =>
    startTransition(async () => {
      const result = await logoutEverywhereAction(u.id);
      if (!result.success) return void toast.error(result.message);
      toast.success(t("logout.done", { count: devices }));
      setOpen(null);
      router.refresh();
    });

  return (
    <>
      <section aria-labelledby="ud-help" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-col border-b border-line-3 px-4.5 py-3.5">
          <h2 id="ud-help" className="m-0 text-[17px] font-semibold">
            {t("help")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("helpSub")}</span>
        </div>
        <ActionRow
          icon="mail"
          title={t("sendLink")}
          sub={!active ? t("linkSuspended") : u.email ? t("linkSub", { email: u.email }) : t("linkNoEmail")}
          subWarn={active && !u.email}
          disabled={!active || !u.email || isPending}
          onClick={sendLink}
        />
        <ActionRow
          icon="key"
          tone="brand"
          title={t("giveCode")}
          sub={active ? t("codeSub") : t("linkSuspended")}
          disabled={!active}
          onClick={() => setOpen("reset")}
        />
        <ActionRow
          icon="logout"
          title={t("logoutAll")}
          sub={devices ? t("logoutSub", { count: devices, names }) : t("noDeviceCount")}
          disabled={!devices}
          last
          onClick={() => setOpen("logout")}
        />
      </section>
      <section aria-labelledby="ud-super" className="flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-white">
        <div className="flex flex-col border-b border-line-3 px-4.5 py-3.5">
          <h2 id="ud-super" className="m-0 text-[17px] font-semibold">
            {t("super")}
          </h2>
          <span className="text-[13px] text-ink-3">{t("superSub")}</span>
        </div>
        <ActionRow icon="smartphone" title={t("changePhone")} sub={t("changePhoneSub")} onClick={() => setOpen("phone")} />
        {active ? (
          <ActionRow icon="ban" tone="danger" title={t("suspend")} sub={t("suspendSub")} last disabled={!!u.staffRole} onClick={() => setOpen("suspend")} />
        ) : (
          <ActionRow icon="checkCircle" tone="success" title={t("unsuspend")} sub={t("unsuspendSub")} last onClick={() => setOpen("unsuspend")} />
        )}
      </section>
      {open === "reset" && <ResetCodeDialog u={u} checks={checks} onClose={() => setOpen(null)} />}
      {open === "phone" && <PhoneDialog u={u} onClose={() => setOpen(null)} />}
      {(open === "suspend" || open === "unsuspend") && <SuspendDialog u={u} suspend={open === "suspend"} onClose={() => setOpen(null)} />}
      {open === "logout" && (
        <FormDialog
          title={t("logout.title", { name: `${u.firstName} ${u.lastName}` })}
          closeLabel={t("close")}
          onClose={() => setOpen(null)}
          size="xs"
          topClass="top-34"
          footer={<DialogButtons cancel={t("cancel")} submit={t("logout.confirm")} onCancel={() => setOpen(null)} onSubmit={logout} pending={isPending} />}
        >
          <p className="m-0 text-[15px] leading-[1.6] text-ink-2">{t("logout.text", { count: devices, names })}</p>
        </FormDialog>
      )}
    </>
  );
}
