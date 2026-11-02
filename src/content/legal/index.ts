import type { Locale } from "@/i18n/config";
import { legalBn } from "./bn";
import { legalEn } from "./en";
import type { LegalContent } from "./types";

const CONTENT: Record<Locale, LegalContent> = { bn: legalBn, en: legalEn };

export const getLegalContent = (locale: Locale) => CONTENT[locale];
