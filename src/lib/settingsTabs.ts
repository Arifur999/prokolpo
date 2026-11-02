// The settings page's tabs, in rail order; the chosen one rides in ?tab=.
export const SETTINGS_TABS = ["general", "phases", "categories", "receipt", "danger"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];
