import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthSurface } from "@/components/modules/Auth/AuthSurface";
import { SupportFooter } from "@/components/modules/Support/SupportFooter";
import { SupportForm } from "@/components/modules/Support/SupportForm";
import { getUserInfo } from "@/services/auth.services";
import type { SupportSource, SupportTopic } from "@/types/support.types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Support");
  return { title: t("title") };
}

// The topic each entry point most likely needs (boards Support, SupportSuspended, SupportInApp).
const DEFAULT_TOPIC: Record<SupportSource, SupportTopic> = { public: "login", forgot: "login", suspended: "other", app: "project" };

export default async function SupportPage({ searchParams }: PageProps<"/support">) {
  const t = await getTranslations("Support");
  const { from, phone } = await searchParams;
  const user = await getUserInfo();

  const source: SupportSource = user ? "app" : from === "forgot" || from === "suspended" ? from : "public";
  const defaults = {
    name: user?.name ?? "",
    phone: user?.phone ?? (typeof phone === "string" ? phone : ""),
    email: user?.email ?? "",
    topic: DEFAULT_TOPIC[source],
    source,
    message: "",
  };
  const note = source === "public" ? undefined : source === "app" ? t("notes.app", { name: defaults.name }) : t(`notes.${source}`);

  return (
    <AuthSurface width="xl">
      <SupportForm defaults={defaults} note={note} isAccountLocked={Boolean(user)} />
      <SupportFooter />
    </AuthSurface>
  );
}
