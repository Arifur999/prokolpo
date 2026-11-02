import type { IPartner } from "@/types/partners.types";

export type PartnerTag = "OWNER" | "MANAGER" | "VIEWER" | "invited" | "inApp" | "notInApp";

// The chip beside a partner's name: their team role, else whether they are invited or on the app.
export const partnerTag = (p: Pick<IPartner, "role" | "invited" | "hasAccount">): PartnerTag =>
  p.role ?? (p.invited ? "invited" : p.hasAccount ? "inApp" : "notInApp");

export const TAG_LOOK: Record<PartnerTag, string> = {
  OWNER: "bg-brand-tint text-brand",
  MANAGER: "bg-info-tint text-info",
  VIEWER: "bg-surface-4 text-ink-2",
  invited: "bg-gold-tint text-gold-ink",
  inApp: "bg-surface-4 text-ink-2",
  notInApp: "bg-gold-tint text-gold-ink",
};
