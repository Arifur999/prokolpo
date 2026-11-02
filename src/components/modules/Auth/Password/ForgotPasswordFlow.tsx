"use client";

import { useState } from "react";
import { ChooseWayStep } from "./ChooseWayStep";
import { LinkSentStep } from "./LinkSentStep";
import { NewPasswordForm } from "./NewPasswordForm";
import { PhoneStep, type FoundAccount } from "./PhoneStep";
import { ResetSteps } from "./ResetSteps";

type Step = { name: "phone" } | { name: "choose"; account: FoundAccount } | { name: "sent"; account: FoundAccount } | { name: "code"; account: FoundAccount };

// Phone, then a way to reset, then "check your email" or the owner's code with a new password.
export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>({ name: "phone" });
  const [phone, setPhone] = useState("");

  return (
    <>
      <ResetSteps current={step.name === "phone" ? "phone" : step.name === "choose" ? "choose" : "password"} />
      {step.name === "phone" && (
        <PhoneStep
          initialPhone={phone}
          onFound={(account) => {
            setPhone(account.phone);
            setStep({ name: "choose", account });
          }}
        />
      )}
      {step.name === "choose" && (
        <ChooseWayStep
          account={step.account}
          onChangeNumber={() => setStep({ name: "phone" })}
          onSent={() => setStep({ name: "sent", account: step.account })}
          onCode={() => setStep({ name: "code", account: step.account })}
        />
      )}
      {step.name === "code" && <NewPasswordForm codeFrom={{ phone: step.account.phone, ownerName: step.account.ownerName ?? "" }} />}
      {step.name === "sent" && <LinkSentStep phone={step.account.phone} maskedEmail={step.account.maskedEmail ?? ""} />}
    </>
  );
}
