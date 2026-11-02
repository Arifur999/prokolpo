import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "./config";

// An explicit locale (getTranslations({ locale: "en" }), used by pages that show both
// languages at once) wins; otherwise the reader's saved choice; otherwise Bangla.
export default getRequestConfig(async ({ locale: explicit }) => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(explicit) ? explicit : isLocale(saved) ? saved : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Asia/Dhaka",
  };
});
