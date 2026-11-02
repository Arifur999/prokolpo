import { isAxiosError } from "axios";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthSurface } from "@/components/modules/Auth/AuthSurface";
import { NewPasswordForm } from "@/components/modules/Auth/Password/NewPasswordForm";
import { ResetLinkProblem, type LinkProblem } from "@/components/modules/Auth/Password/ResetLinkProblem";
import { ResetSteps } from "@/components/modules/Auth/Password/ResetSteps";
import { ROUTES } from "@/lib/routes";
import { checkResetLink } from "@/services/auth.services";
import { AUTH_ERROR_CODES } from "@/types/auth.types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.reset");
  return { title: t("title") };
}

type LinkState = { ok: true; maskedEmail: string | null } | { ok: false; problem: LinkProblem };

const PROBLEM_BY_CODE: Record<string, LinkProblem> = {
  [AUTH_ERROR_CODES.resetLinkExpired]: "expired",
  [AUTH_ERROR_CODES.resetLinkUsed]: "used",
  [AUTH_ERROR_CODES.resetLinkInvalid]: "invalid",
};

// A link the API refuses becomes one of the design's problem states; any other failure
// (API down) goes to the error page instead of telling someone their link is bad.
const inspectLink = async (token: string | undefined): Promise<LinkState> => {
  if (!token) return { ok: false, problem: "invalid" };
  try {
    return { ok: true, maskedEmail: (await checkResetLink(token)).maskedEmail };
  } catch (error) {
    const code = isAxiosError(error) ? (error.response?.data as { code?: string } | undefined)?.code : undefined;
    const problem = code ? PROBLEM_BY_CODE[code] : undefined;
    if (problem) return { ok: false, problem };
    throw error;
  }
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const t = await getTranslations("Auth.forgot");
  const { token } = await searchParams;
  const tokenValue = typeof token === "string" ? token : undefined;
  const link = await inspectLink(tokenValue);

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
      <ResetSteps current="password" />
      {link.ok && tokenValue ? <NewPasswordForm token={tokenValue} maskedEmail={link.maskedEmail} /> : !link.ok && <ResetLinkProblem problem={link.problem} />}
    </AuthSurface>
  );
}
