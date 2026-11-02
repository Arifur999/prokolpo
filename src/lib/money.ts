// Taka as the design writes it: Latin digits in Indian grouping ("1,56,40,500"), whole taka.

const grouping = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const percentFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export const formatAmount = (amount: number) => grouping.format(Math.round(amount));

const quantityFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

// A quantity as weighed or counted: "1,050", "2.5".
export const formatQuantity = (quantity: number) => quantityFormat.format(quantity);

// "62.6%", "103%".
export const formatPercent = (percent: number) => `${percentFormat.format(percent)}%`;

// Share of budget spent, or null when there is no budget to measure against.
export const budgetPercent = (spent: number, budget: number | null) => (budget ? (spent / budget) * 100 : null);

// The design's thresholds: yellow past 90%, red past 100%.
export type BudgetTone = "ok" | "near" | "over";
export const budgetTone = (percent: number): BudgetTone => (percent > 100 ? "over" : percent >= 90 ? "near" : "ok");

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

// Typed input may come in Bangla digits; keep only the digits, in Latin.
export const toLatinDigits = (value: string) => value.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d))).replace(/[^0-9]/g, "");

// A typed quantity: Latin digits and at most one point with three decimals ("1050", "2.5").
export const toDecimalDigits = (value: string) => {
  const latin = value.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d))).replace(/[^0-9.]/g, "");
  const [whole = "", ...rest] = latin.split(".");
  return rest.length ? `${whole.slice(0, 9)}.${rest.join("").slice(0, 3)}` : whole.slice(0, 9);
};

// The amount split the way people say it: crore, lakh, thousand, the rest.
export const amountParts = (amount: number) => ({
  crore: Math.floor(amount / 10_000_000),
  lakh: Math.floor((amount % 10_000_000) / 100_000),
  thousand: Math.floor((amount % 100_000) / 1000),
  rest: amount % 1000,
});
