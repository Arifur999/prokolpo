import { lastSale, saleAmount } from "@/lib/produceLook";
import type { IBatch, IProduceBook, ProduceProduct, ProduceUnit } from "@/types/produce.types";

// The produce sale form as typed: quantity may carry decimals, money is whole taka digits.
export type SaleDraft = {
  product: ProduceProduct;
  unit: ProduceUnit;
  phaseId: string;
  quantity: string;
  rate: string;
  buyer: string;
  date: string;
  fullPaid: boolean;
  got: string;
  accountId: string;
};

export type SaleProblem = "errQty" | "errRate" | "errBuyer" | "errGot";

// The batch a new sale most likely belongs to: the one still running, else the latest,
// else the first on a farm with nothing written yet.
export const defaultBatch = (batches: IBatch[]) => {
  const live = batches.filter((b) => b.startedOn || b.cost > 0 || b.sales > 0);
  return (live.findLast((b) => !b.endedOn) ?? live.at(-1) ?? batches[0])?.id ?? "";
};

export const figures = (d: SaleDraft) => {
  const amount = saleAmount(Number(d.quantity || 0), Number(d.rate || 0));
  const got = d.fullPaid ? amount : Number(d.got || 0);
  return { amount, got, left: amount - got };
};

export const saleProblem = (d: SaleDraft): SaleProblem | null => {
  const { amount, got } = figures(d);
  if (!Number(d.quantity)) return "errQty";
  if (!Number(d.rate)) return "errRate";
  if (!d.buyer.trim()) return "errBuyer";
  if (got > amount) return "errGot";
  return null;
};

export const rateHint = (book: IProduceBook, d: SaleDraft) => lastSale(book.sales, d.product, d.unit);
