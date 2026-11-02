export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "bn";

// No locale in the URL: the design keeps one set of paths and switches language in place.
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isLocale = (value: string | undefined): value is Locale => LOCALES.some((locale) => locale === value);
