import type { IconName } from "@/components/shared/icon/iconPaths";
import type { AccountKind } from "@/types/books.types";

// Each account keeps a colour by the order it was opened (board Accounts: cash green,
// bank blue, bKash pink), used for its icon, its slice of the share bar and its ledger dot.
const LOOKS = [
  { color: "bg-acc-1", text: "text-acc-1", tint: "bg-acc-1-tint" },
  { color: "bg-acc-2", text: "text-acc-2", tint: "bg-acc-2-tint" },
  { color: "bg-acc-3", text: "text-acc-3", tint: "bg-acc-3-tint" },
  { color: "bg-acc-4", text: "text-acc-4", tint: "bg-acc-4-tint" },
] as const;

export const accountLook = (index: number) => LOOKS[index % LOOKS.length]!;

export const ACCOUNT_ICON: Record<AccountKind, IconName> = { CASH: "banknote", BANK: "building", MOBILE: "phone" };
