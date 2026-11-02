import type { IBatch, IProduceBook, IProduceSale, ProduceProduct, ProduceUnit } from "@/types/produce.types";
import type { FarmType } from "@/types/project.types";

// What each kind of farm sells and in which units, as the API accepts them (board
// FarmSales: poultry sells birds, eggs, litter and empty feed sacks).
const PRODUCTS: Record<FarmType, [ProduceProduct, ProduceUnit[]][]> = {
  POULTRY: [
    ["BROILER", ["KG", "PIECE"]],
    ["EGG", ["PIECE", "HALI", "TRAY"]],
    ["LITTER", ["SACK"]],
    ["SACK", ["ITEM"]],
  ],
  CATTLE: [
    ["MILK", ["LITRE"]],
    ["CATTLE", ["HEAD"]],
    ["DUNG", ["SACK", "KG"]],
  ],
  FISH: [["FISH", ["KG", "MAUND"]]],
  CROP: [["CROP", ["KG", "MAUND"]]],
};

export const productsFor = (farmType: FarmType | ""): [ProduceProduct, ProduceUnit[]][] => [...(farmType ? PRODUCTS[farmType] : []), ["OTHER", ["ITEM", "KG"]]];

// Price per unit to whole taka, as the API rounds it.
export const saleAmount = (quantity: number, rate: number) => Math.round(quantity * rate);

// A batch that has not started and has nothing written against it is not shown yet.
export const batchStarted = (b: IBatch) => !!b.startedOn || b.cost > 0 || b.sales > 0;
export const batchRunning = (b: IBatch) => !b.endedOn;
export const batchProfit = (b: IBatch) => b.sales - b.cost;

// Cost and price per kilo of what the batch sold by weight.
export const perKilo = (b: IBatch) => (b.weight ? { cost: b.cost / b.weight, price: b.weightSales / b.weight } : null);

export const lossRate = (b: IBatch) => (b.headCount ? (b.losses / b.headCount) * 100 : null);

// The summary cards: all sales, the profit of finished batches, what buyers owe, and how much
// of the setup cost finished batches have paid back.
export const produceSummary = (book: IProduceBook) => {
  const finished = book.batches.filter((b) => batchStarted(b) && !batchRunning(b));
  const profit = finished.reduce((n, b) => n + batchProfit(b), 0);
  const setupPercent = book.setupCost ? Math.max(0, Math.min(100, (profit / book.setupCost) * 100)) : 0;
  return {
    total: book.sales.reduce((n, s) => n + s.amount, 0),
    batchCount: book.batches.filter(batchStarted).length,
    finished: finished.length,
    gains: finished.filter((b) => batchProfit(b) >= 0).length,
    profit,
    due: book.dues.reduce((n, d) => n + d.amount, 0),
    setupPercent,
    setupBack: Math.max(0, Math.min(profit, book.setupCost)),
    setupLeft: Math.max(0, book.setupCost - profit),
  };
};

// "কী থেকে কত আয়": each product's share of all sales, the biggest first.
export const incomeMix = (sales: IProduceSale[]) => {
  const total = sales.reduce((n, s) => n + s.amount, 0);
  const by = new Map<ProduceProduct, number>();
  for (const s of sales) by.set(s.product, (by.get(s.product) ?? 0) + s.amount);
  return [...by].map(([product, amount]) => ({ product, amount, percent: total ? (amount / total) * 100 : 0 })).sort((a, b) => b.amount - a.amount);
};

// The last rate the same thing sold at, as a hint beside the rate field.
export const lastSale = (sales: IProduceSale[], product: ProduceProduct, unit: ProduceUnit) =>
  sales.find((s) => s.product === product && s.unit === unit) ?? null;
