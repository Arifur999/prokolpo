import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/routes";
import { CenteredState, NoteBox } from "./CenteredState";

export type LinkProblem = "expired" | "used" | "invalid";

export function ResetLinkProblem({ problem, maskedEmail }: { problem: LinkProblem; maskedEmail?: string | null }) {
  const t = useTranslations("Auth.reset");
  const body =
    problem === "expired"
      ? maskedEmail
        ? t("expiredBody", { email: maskedEmail })
        : t("expiredBodyNoEmail")
      : problem === "used"
        ? t("usedBody")
        : t("invalidBody");

  return (
    <div className="flex flex-col gap-6">
      <CenteredState icon="clock" tone="danger" title={t(`${problem}Title`)}>
        {body}
      </CenteredState>
      <NoteBox>{t("securityNote")}</NoteBox>
      <div className="flex gap-2.5">
        <Link
          href={ROUTES.forgotPassword}
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white no-underline hover:text-white"
        >
          {t("newLink")}
        </Link>
        <Link
          href={ROUTES.login}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-[15px] font-semibold text-ink no-underline hover:text-ink"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
