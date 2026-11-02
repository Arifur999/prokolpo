import type messages from "../../messages/bn.json";
import type { Locale } from "@/i18n/config";

// Bangla is the source of truth: a key missing from bn.json is a type error everywhere.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
