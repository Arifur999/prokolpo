import type { IKhataPerson, IShopBook, IShopDay, IShopLine } from "@/types/shop.types";

const DAY_MS = 86_400_000;

// What a day sold: cash, bKash and credit (paybacks and other income are not sales).
export const daySales = (d: Pick<IShopDay, "cash" | "mobile" | "credit">) => d.cash + d.mobile + d.credit;

// "2026-10" for a YYYY-MM-DD date, and the month before it.
export const monthOf = (iso: string) => iso.slice(0, 7);
export const monthBefore = (month: string) => {
  const [y = 0, m = 1] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
};
const daysIn = (month: string) => {
  const [y = 0, m = 1] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

export const daysAgo = (from: string, today: string) => Math.round((Date.parse(today) - Date.parse(from)) / DAY_MS);

// The sales page's figures: this month so far against the same days last month, last month's
// days for the chart, and last month's sales less what was spent.
export const shopFigures = (book: IShopBook, today: string) => {
  const month = monthOf(today);
  const last = monthBefore(month);
  const inMonth = (m: string) => book.days.filter((d) => monthOf(d.date) === m);
  const now = inMonth(month);
  const before = inMonth(last);
  const sum = (list: IShopDay[]) => list.reduce((n, d) => n + daySales(d), 0);
  const upTo = Math.max(0, ...now.map((d) => Number(d.date.slice(8))));
  const bars = Array.from({ length: daysIn(last) }, (_, i) => {
    const date = `${last}-${String(i + 1).padStart(2, "0")}`;
    const day = before.find((d) => d.date === date);
    return { date, amount: day ? daySales(day) : 0 };
  });
  const lastTotal = sum(before);
  const best = bars.reduce((top, b) => (b.amount > top.amount ? b : top), bars[0] ?? { date: "", amount: 0 });
  const spent = book.expenses.find((e) => e.month === last)?.amount ?? 0;
  return {
    month,
    last,
    total: sum(now),
    dayCount: now.length,
    sameDaysLast: before.filter((d) => Number(d.date.slice(8)) <= upTo).reduce((n, d) => n + daySales(d), 0),
    lastTotal,
    lastAverage: before.length ? lastTotal / before.length : 0,
    best,
    bars,
    spent,
    net: lastTotal - spent,
    khata: book.khata.reduce((n, k) => n + k.due, 0),
    oldest: Math.max(0, ...book.khata.map((k) => (k.since ? daysAgo(k.since, today) : 0))),
    todayDone: book.days.some((d) => d.date === today),
  };
};

// A khata name as the API matches it: trimmed, any case.
export const nameKey = (name: string) => name.trim().toLowerCase();

// The credit book once a day's lines are written: new credit adds, paybacks subtract.
export const khataAfter = (khata: IKhataPerson[], credits: IShopLine[], collects: IShopLine[]) => {
  const due = new Map(khata.map((k) => [nameKey(k.name), k.due]));
  for (const c of credits) if (c.name.trim() && c.amount) due.set(nameKey(c.name), (due.get(nameKey(c.name)) ?? 0) + c.amount);
  for (const c of collects) {
    const key = nameKey(c.name);
    if (due.has(key)) due.set(key, (due.get(key) ?? 0) - c.amount);
  }
  return [...due.values()].filter((n) => n > 0).reduce((n, v) => n + v, 0);
};

// Cash that should be in the drawer after the day: cash sales, paybacks and other income.
export const expectedCash = (d: { cash: number; other: number; collects: IShopLine[] }) => d.cash + d.other + d.collects.reduce((n, c) => n + c.amount, 0);

// The last day before this one on the same weekday, to compare totals.
export const sameWeekday = (days: IShopDay[], today: string) => {
  const weekday = new Date(today).getUTCDay();
  return days.find((d) => d.date < today && new Date(d.date).getUTCDay() === weekday) ?? null;
};
