import type { IPartner } from "@/types/partners.types";

// A partner keeps the colour of their place in the list (board PartnerList).
export const PARTNER_COLORS = ["#1a9a6c", "#2a78d6", "#eb6834", "#7a5ac8", "#d4a21a", "#c2417a", "#3a9fb0", "#8C918E"] as const;
export const partnerColor = (index: number) => PARTNER_COLORS[index % PARTNER_COLORS.length] ?? PARTNER_COLORS[0];

// What a partner should have put in: their commitment plus their part of every call.
export const owedBy = (p: Pick<IPartner, "committed" | "callShare">) => p.committed + p.callShare;
export const dueOf = (p: Pick<IPartner, "committed" | "callShare" | "paid">) => owedBy(p) - p.paid;

// Shares are kept to one decimal; working in tenths keeps the sums exact.
export const toTenths = (share: number) => Math.round(share * 10);
export const fromTenths = (tenths: number) => tenths / 10;

// "12.5%" or "40%".
export const percentText = (share: number) => `${Math.round(share * 10) / 10}%`;

// A call split by shares (in tenths): parts rounded down, what is left to the biggest
// share, as the API does it.
export const splitCall = (total: number, tenths: number[]) => {
  const parts = tenths.map((t) => Math.floor((total * t) / 1000));
  const biggest = tenths.reduce((best, t, i) => (t > (tenths[best] ?? 0) ? i : best), 0);
  if (parts.length) parts[biggest] = (parts[biggest] ?? 0) + total - parts.reduce((sum, x) => sum + x, 0);
  return parts;
};

// Everyone's share once a newcomer takes `share` out of the others at the same rate,
// rounded to one decimal with the rounding left on the biggest share.
export const proportionalShares = (partners: Pick<IPartner, "id" | "share">[], share: number): Record<string, number> => {
  const newTenths = toTenths(share);
  const next = Object.fromEntries(partners.map((p) => [p.id, Math.round((toTenths(p.share) * (1000 - newTenths)) / 1000)]));
  const drift = 1000 - newTenths - Object.values(next).reduce((sum, t) => sum + t, 0);
  const biggest = partners.reduce<(typeof partners)[number] | undefined>((best, p) => (!best || p.share > best.share ? p : best), undefined);
  if (biggest && drift) next[biggest.id] = (next[biggest.id] ?? 0) + drift;
  return Object.fromEntries(Object.entries(next).map(([id, t]) => [id, fromTenths(t)]));
};
