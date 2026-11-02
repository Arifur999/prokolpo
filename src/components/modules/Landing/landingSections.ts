// In-page anchors shared by the header nav, the footer nav and the sections themselves.
export const LANDING_SECTIONS = [
  { id: "lp-kinds", navKey: "kinds" },
  { id: "lp-features", navKey: "features" },
  { id: "lp-how", navKey: "how" },
  { id: "lp-faq", navKey: "faq" },
] as const;

export type LandingSectionId = (typeof LANDING_SECTIONS)[number]["id"];
