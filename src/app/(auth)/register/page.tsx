import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/modules/Auth/AuthCard";
import { AuthSurface } from "@/components/modules/Auth/AuthSurface";
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
  const footer = (
    <>
      {t("haveAccount")}{" "}
      <Link href={ROUTES.login} className="font-semibold">
        {t("login")}
      </Link>
    </>
  );

  // While closed, the notice writes its own heading: it changes once an invitation is found.
  if (!isOpen) {
    return (
      <AuthSurface width="lg" footer={footer}>
        <RegistrationClosedNotice />
      </AuthSurface>
    );
  }
  return (
    <AuthCard width="lg" title={t("title")} subtitle={t("subtitle")} footer={footer}>
      <RegisterForm />
    </AuthCard>
  );
}
