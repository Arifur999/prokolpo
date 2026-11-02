import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthSurface } from "@/components/modules/Auth/AuthSurface";
import { ForgotPasswordFlow } from "@/components/modules/Auth/Password/ForgotPasswordFlow";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.forgot");
  return { title: t("title") };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth.forgot");

  return (
    <AuthSurface
      width="lg"
      className="sm:px-10 sm:py-9"
      footer={
        <>
          {t("remembered")}{" "}
          <Link href={ROUTES.login} className="font-semibold">
            {t("login")}
          </Link>
        </>
      }
    >
      <ForgotPasswordFlow />
    </AuthSurface>
  );
}
