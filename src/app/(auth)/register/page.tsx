import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/modules/Auth/AuthCard";
import { RegisterForm } from "@/components/modules/Auth/Register/RegisterForm";
import { RegistrationClosedNotice } from "@/components/modules/Auth/Register/RegistrationClosedNotice";
import { ROUTES } from "@/lib/routes";
import { getRegistrationMode } from "@/services/auth.services";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.register");
  return { title: t("title") };
}

export default async function RegisterPage() {
  const t = await getTranslations("Auth.register");
  const isOpen = (await getRegistrationMode()) === "open";

  return (
    <AuthCard
      width="lg"
      title={isOpen ? t("title") : t("closedTitle")}
      subtitle={isOpen ? t("subtitle") : t("closedSubtitle")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href={ROUTES.login} className="font-semibold">
            {t("login")}
          </Link>
        </>
      }
    >
      {isOpen ? <RegisterForm /> : <RegistrationClosedNotice />}
    </AuthCard>
  );
}
