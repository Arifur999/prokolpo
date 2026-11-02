"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { sendResetLinkAction } from "@/app/(auth)/forgot-password/_action";
import { supportHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AuthHeading } from "../AuthHeading";
import { SubmitButton } from "../SubmitButton";
import type { FoundAccount } from "./PhoneStep";

type Way = "email" | "code";

// "01755889900" -> "01755-889900", as the design writes numbers.
const formatPhone = (phone: string) => `${phone.slice(0, 5)}-${phone.slice(5)}`;

type ChooseWayStepProps = {
  account: FoundAccount;
  onChangeNumber: () => void;
  onSent: () => void;
  onCode: () => void;
};

export function ChooseWayStep({ account, onChangeNumber, onSent, onCode }: ChooseWayStepProps) {
  const t = useTranslations("Auth.forgot");
  // A member is most likely to reach their owner; an owner can only use email.
  const [way, setWay] = useState<Way | null>(account.canUseOwnerCode ? "code" : account.canUseEmail ? "email" : null);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const ways: { key: Way; title: string; body: string; enabled: boolean }[] = [
    {
      key: "email",
      title: t("emailWay"),
      body: account.maskedEmail ? t("emailWayOn", { email: account.maskedEmail }) : t("emailWayOff"),
      enabled: account.canUseEmail,
    },
    {
      key: "code",
      title: t("codeWay"),
      body: account.canUseOwnerCode ? t("codeWayOn", { owner: account.ownerName ?? "", project: account.projectName ?? "" }) : t("codeWayOwner"),
      enabled: account.canUseOwnerCode,
    },
  ];

  const send = () =>
    startTransition(async () => {
      const result = await sendResetLinkAction(account.phone);
      if (result.success) onSent();
      else setError(result.message);
    });

  return (
    <div className="flex flex-col gap-6">
      <AuthHeading
        title={t("chooseTitle")}
        subtitle={
          <>
            {account.name} · {formatPhone(account.phone)} ·{" "}
            <button
              type="button"
              onClick={onChangeNumber}
              className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-semibold text-brand underline"
            >
              {t("changeNumber")}
            </button>
          </>
        }
      />
      <div role="radiogroup" aria-label={t("waysLabel")} className="flex flex-col gap-2.5">
        {ways.map((option) => {
          const isChosen = way === option.key && option.enabled;
          return (
            <label
              key={option.key}
              className={cn(
                "flex items-start gap-3 rounded-[14px]",
                isChosen ? "border-2 border-brand bg-brand-wash p-[15px]" : "border border-line bg-white p-4",
                option.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-55",
              )}
            >
              <input
                type="radio"
                name="fp-way"
                checked={isChosen}
                disabled={!option.enabled}
                onChange={() => setWay(option.key)}
                className="mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-semibold">{option.title}</span>
                <span className="text-sm leading-normal text-ink-2">{option.body}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="m-0 text-sm text-danger">
          {error}
        </p>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (way === "code") onCode();
          else send();
        }}
      >
        <SubmitButton isSubmitting={isPending} disabled={!way} label={way === "code" ? t("codeNext") : t("sendLink")} submittingLabel={t("sending")} />
      </form>
      <p className="m-0 text-[13px] leading-[1.55] text-ink-3">
        {t("supportNote")}{" "}
        <Link href={supportHref("forgot", account.phone)} className="font-semibold">
          {t("supportLink")}
        </Link>
      </p>
    </div>
  );
}
