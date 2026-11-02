import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/modules/Legal/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Legal");
  return { title: t("privacy") };
}

export default function PrivacyPage() {
  return <LegalPage part="privacy" />;
}
