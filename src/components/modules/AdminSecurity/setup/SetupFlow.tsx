"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { IStaffStatus } from "@/types/staff.types";
import { BackupStep } from "./BackupStep";
import { ScanStep } from "./ScanStep";
import { SetupSteps } from "./SetupSteps";

type SetupFlowProps = { status: IStaffStatus; qrSvg: string; setupKey: string; next: string };

// Setting up the second step (boards AdminTwoFactorSetup, AdminTwoFactorBackup).
export function SetupFlow({ status, qrSvg, setupKey, next }: SetupFlowProps) {
  const [codes, setCodes] = useState<string[] | null>(null);
  const router = useRouter();
  // Already on, and not because of this visit: the second step is asked on the verify page.
  const elsewhere = status.enabled && !codes;
  useEffect(() => {
    if (elsewhere) router.replace("/admin/verify");
  }, [elsewhere, router]);
  if (elsewhere) return null;
  return (
    <section
      aria-labelledby="tf-title"
      className="box-border flex w-full max-w-195 flex-col gap-5.5 rounded-[20px] bg-white px-5 pt-7.5 pb-8 shadow-[0_24px_64px_rgb(0_0_0/0.35)] sm:px-9"
    >
      <SetupSteps at={codes ? 1 : 0} />
      {codes ? (
        <BackupStep codes={codes} phone={status.phone} next={next} />
      ) : (
        <ScanStep status={status} qrSvg={qrSvg} setupKey={setupKey} onEnabled={setCodes} />
      )}
    </section>
  );
}
