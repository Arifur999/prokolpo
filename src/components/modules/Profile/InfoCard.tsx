"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProfileAction } from "@/app/(dashboardLayout)/(home)/profile/_action";
import { Icon } from "@/components/shared/icon/Icon";
import { LabeledInput } from "@/components/shared/form/LabeledInput";
import { formatDate } from "@/lib/dhakaTime";
import { displayPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { IProfile, IProfilePayload } from "@/types/account.types";
import { PhoneDialog } from "./PhoneDialog";
import { ProfileCard } from "./ProfileCard";
import { initialsOf } from "./profileLook";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const valuesOf = (p: IProfile): IProfilePayload => ({ firstName: p.firstName, lastName: p.lastName, companyName: p.companyName ?? "", email: p.email ?? "" });

// "আপনার তথ্য" (board Profile): name, company and email, with the login number beside them.
export function InfoCard({ profile }: { profile: IProfile }) {
  const t = useTranslations("Profile.info");
  const router = useRouter();
  const saved = valuesOf(profile);
  const [values, setValues] = useState(saved);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const clean = JSON.stringify(values) === JSON.stringify(saved);
  const firstBad = !values.firstName.trim();
  const emailBad = values.email.trim() !== "" && !EMAIL.test(values.email.trim());
  const blocked = clean || firstBad || emailBad || isPending;
  const set = (patch: Partial<IProfilePayload>) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors({});
  };

  const save = () =>
    startTransition(async () => {
      const result = await saveProfileAction(values);
      if (!result.success) {
        setErrors(result.fieldErrors ?? {});
        return void toast.error(result.message);
      }
      toast.success(t("saved"));
      router.refresh();
    });

  const owned = profile.projects.length;
  const footer = (
    <>
      <span className={cn("text-[13px]", clean ? "text-ink-3" : "text-gold-ink")}>{clean ? t("clean") : t("dirty")}</span>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setValues(saved)}
          disabled={clean}
          className="h-11 cursor-pointer rounded-[10px] border border-line bg-white px-4 text-[15px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={blocked}
          className={cn(
            "h-11 rounded-[10px] border-none px-4.5 text-[15px] font-semibold text-white",
            blocked ? "cursor-not-allowed bg-brand-soft" : "cursor-pointer bg-brand",
          )}
        >
          {t("save")}
        </button>
      </div>
    </>
  );

  return (
    <ProfileCard
      id="pf-info"
      title={t("title")}
      sub={t("sub", { date: formatDate(new Date(profile.createdAt)), count: owned })}
      lead={
        <span aria-hidden="true" className="flex size-15 shrink-0 items-center justify-center rounded-full bg-gold text-[21px] font-bold text-brand">
          {initialsOf(profile.name)}
        </span>
      }
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 px-5.5 py-4.5 sm:grid-cols-2">
        <LabeledInput
          id="pf-first"
          label={t("first")}
          labelNote={<span className="text-danger">*</span>}
          value={values.firstName}
          maxLength={30}
          onChange={(event) => set({ firstName: event.target.value })}
          error={firstBad ? t("firstMissing") : errors.firstName}
        />
        <LabeledInput
          id="pf-last"
          label={t("last")}
          value={values.lastName}
          maxLength={30}
          onChange={(event) => set({ lastName: event.target.value })}
          error={errors.lastName}
        />
        <LabeledInput
          id="pf-co"
          label={t("company")}
          labelNote={<span className="font-normal text-ink-3">{t("optional")}</span>}
          value={values.companyName}
          maxLength={80}
          onChange={(event) => set({ companyName: event.target.value })}
          hint={t("companyHint")}
          error={errors.companyName}
        />
        <LabeledInput
          id="pf-email"
          type="email"
          label={t("email")}
          labelNote={<span className="font-normal text-ink-3">{t("optional")}</span>}
          value={values.email}
          onChange={(event) => set({ email: event.target.value })}
          error={emailBad ? t("emailBad") : errors.email}
        />
        <div className="flex flex-wrap items-center gap-3.5 rounded-xl bg-surface-2 px-3.5 py-3 sm:col-span-2">
          <Icon name="smartphone" size={20} strokeWidth={2} className="text-ink-2" />
          <span className="flex grow flex-col">
            <span className="text-xs text-ink-3">{t("phoneLabel")}</span>
            <strong className="text-base font-bold">{displayPhone(profile.phone)}</strong>
          </span>
          <button
            type="button"
            onClick={() => setPhoneOpen(true)}
            className="h-9.5 cursor-pointer rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-ink"
          >
            {t("changePhone")}
          </button>
        </div>
      </div>
      {phoneOpen && <PhoneDialog current={profile.phone} onClose={() => setPhoneOpen(false)} />}
    </ProfileCard>
  );
}
