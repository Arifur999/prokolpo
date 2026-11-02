import { getTranslations } from "next-intl/server";
import { FaqList } from "./FaqList";
import { SectionHeading } from "./SectionHeading";

const TITLE_ID = "lp-faq-title";
const FAQ_KEYS = ["mobile", "invite", "roles", "restore", "opening", "english", "backup"] as const;

export async function FaqSection() {
  const t = await getTranslations("Landing.faq");
  const items = FAQ_KEYS.map((key) => ({ key, question: t(`items.${key}.q`), answer: t(`items.${key}.a`) }));

  return (
    <section
      id="lp-faq"
      aria-labelledby={TITLE_ID}
      className="grid shrink-0 items-start gap-10 px-page py-20 xl:h-180 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-20"
    >
      <SectionHeading id={TITLE_ID} eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} leadClassName="text-base leading-[1.65]" />
      <FaqList items={items} />
    </section>
  );
}
