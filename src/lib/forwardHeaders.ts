import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/i18n/config";

// The browser never calls the API, so this server tells it what it would have sent itself:
// the reader's language (API messages follow it) and, for the sessions list, where they are.
export const forwardHeadersFrom = (incoming: Headers, locale: string | undefined): Record<string, string> => {
  const forwarded = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip") || "";
  const out: Record<string, string> = { "Accept-Language": isLocale(locale) ? locale : DEFAULT_LOCALE };
  if (forwarded) out["X-Forwarded-For"] = forwarded;
  const userAgent = incoming.get("user-agent");
  if (userAgent) out["User-Agent"] = userAgent;
  return out;
};

// For Server Components and Server Actions; proxy.ts passes its request headers to forwardHeadersFrom.
export const getForwardHeaders = async () => forwardHeadersFrom(await headers(), (await cookies()).get(LOCALE_COOKIE)?.value);
