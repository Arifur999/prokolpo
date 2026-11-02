import type { FarmType } from "./project.types";

export type ProduceProduct = "BROILER" | "EGG" | "LITTER" | "SACK" | "MILK" | "CATTLE" | "DUNG" | "FISH" | "CROP" | "OTHER";
export type ProduceUnit = "KG" | "PIECE" | "HALI" | "TRAY" | "SACK" | "ITEM" | "LITRE" | "HEAD" | "MAUND";

export interface IBatch {
  id: string;
  name: string;
  startedOn: string | null;
  endedOn: string | null;
  headCount: number | null;
  losses: number;
  note: string | null;
  cost: number;
  sales: number;
  // Kilos of produce sold by weight (birds, fish, crops) and what they fetched.
  weight: number;
  weightSales: number;
}

export interface IProduceSale {
  id: string;
  date: string;
  phaseId: string | null;
  product: ProduceProduct;
  unit: ProduceUnit;
  quantity: number;
  rate: number;
  amount: number;
  left: number;
  buyerId: string;
  buyer: string;
  createdAt: string;
}

export interface IBuyerDue {
  buyerId: string;
  buyer: string;
  amount: number;
  since: string;
}

export interface IProduceBook {
  farmType: FarmType | "";
  batches: IBatch[];
  setupName: string;
  setupCost: number;
  sales: IProduceSale[];
  dues: IBuyerDue[];
  buyers: { id: string; name: string }[];
}

export interface IProduceSalePayload {
  product: ProduceProduct;
  phaseId: string;
  quantity: number;
  unit: ProduceUnit;
  rate: number;
  buyer: string;
  date: string;
  received: number;
  accountId: string;
}

export interface IBatchPayload {
  startedOn: string;
  endedOn: string;
  headCount: number | null;
  losses: number;
  note: string;
}
