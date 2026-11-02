import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/modules/Auth/AuthCard";
import { LoginForm } from "@/components/modules/Auth/Login/LoginForm";
import { SESSION_EXPIRED_REASON } from "@/lib/authUtils";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.login");
  return { title: t("submit") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const t = await getTranslations("Auth.login");
  const { redirect, reason } = await searchParams;

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href={ROUTES.register} className="font-semibold">
            {t("createAccount")}
          </Link>
        </>
      }
    >
      {reason === SESSION_EXPIRED_REASON && (
        <p role="status" className="m-0 -mb-2 rounded-xl border border-gold-line bg-gold-tint px-4 py-3 text-sm font-semibold text-gold-deep">
          {t("sessionExpired")}
        </p>
      )}
      <LoginForm redirectTo={typeof redirect === "string" ? redirect : undefined} />
    </AuthCard>
  );
}
