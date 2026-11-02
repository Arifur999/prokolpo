"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { sendResetLinkAction } from "@/app/(auth)/forgot-password/_action";
import { ROUTES } from "@/lib/routes";
import { CenteredState, NoteBox } from "./CenteredState";

export function LinkSentStep({ phone, maskedEmail }: { phone: string; maskedEmail: string }) {
  const t = useTranslations("Auth.forgot");
  const [isPending, startTransition] = useTransition();

  const resend = () =>
    startTransition(async () => {
      const result = await sendResetLinkAction(phone);
      if (result.success) toast.success(t("resent"));
      else toast.error(result.message);
    });

  return (
    <div className="flex flex-col gap-6">
      <CenteredState icon="mail" tone="brand" title={t("sentTitle")}>
        {t("sentBody", { email: maskedEmail })}
      </CenteredState>
      <NoteBox>{t("sentHelp")}</NoteBox>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={resend}
          disabled={isPending}
          className="h-12 flex-1 cursor-pointer rounded-xl border border-line bg-white text-[15px] font-semibold text-ink disabled:cursor-progress"
        >
          {t("resend")}
        </button>
        <Link
          href={ROUTES.login}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white no-underline hover:text-white"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
