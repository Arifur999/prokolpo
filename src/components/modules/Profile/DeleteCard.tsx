"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteAccountAction } from "@/app/(dashboardLayout)/(home)/profile/_action";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { DialogButtons, FormDialog } from "@/components/shared/FormDialog";
import { Icon } from "@/components/shared/icon/Icon";
import { cn } from "@/lib/utils";

// "অ্যাকাউন্ট মুছুন" (board Profile): closed while the account owns a project; otherwise a
// password-confirmed delete that signs this browser out.
export function DeleteCard({ owned, isStaff }: { owned: number; isStaff: boolean }) {
  const t = useTranslations("Profile.delete");
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const blocked = owned > 0 || isStaff;

  const confirm = () =>
    startTransition(async () => {
      if (!password) return setError(t("passwordMissing"));
      const result = await deleteAccountAction(password);
      if (!result.success) setError(result.fieldErrors?.password ?? result.message);
    });

  return (
    <section aria-labelledby="pf-del" className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-danger-line bg-white px-5 py-4.5">
      <h2 id="pf-del" className="m-0 text-[17px] font-semibold text-danger">
        {t("title")}
      </h2>
      <p className="m-0 text-sm leading-[1.6] text-ink-2">{t("body")}</p>
      {blocked && (
        <p className="m-0 flex items-start gap-2 rounded-[10px] bg-gold-wash px-3 py-2.5 text-[13px] leading-normal text-gold-deep">
          <Icon name="alertTriangle" size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{isStaff ? t("staff") : t("owned", { count: owned })}</span>
        </p>
      )}
      <button
        type="button"
        disabled={blocked}
        onClick={() => setOpen(true)}
        className={cn(
          "h-10.5 self-start rounded-[10px] border bg-white px-4 text-sm font-semibold",
          blocked ? "cursor-not-allowed border-danger-line text-danger/50" : "cursor-pointer border-danger-strong text-danger",
        )}
      >
        {t("button")}
      </button>
      {open && (
        <FormDialog
          title={t("confirmTitle")}
          subtitle={t("confirmSub")}
          closeLabel={t("cancel")}
          onClose={() => setOpen(false)}
          size="xs"
          footer={<DialogButtons cancel={t("cancel")} submit={t("confirm")} onCancel={() => setOpen(false)} onSubmit={confirm} pending={isPending} />}
        >
          <LabeledInput
            id="del-pw"
            password
            autoComplete="current-password"
            label={t("password")}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(undefined);
            }}
            error={error}
          />
        </FormDialog>
      )}
    </section>
  );
}
