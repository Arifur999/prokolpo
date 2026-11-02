import type { IKhataPerson, IShopDay, IShopLine } from "@/types/shop.types";

// One typed row: a name and whole-taka digits.
export type DraftLine = { name: string; amount: string };

export type DayDraft = {
  cash: string;
  mobile: string;
  other: string;
  note: string;
  counted: string;
  credits: DraftLine[];
  collects: DraftLine[];
};

export type DayProblem = "empty" | "needName" | "badCollect";

const num = (s: string) => Number(s || 0);
const digits = (n: number) => (n ? String(n) : "");

export const draftFrom = (day: IShopDay | null): DayDraft => ({
  cash: digits(day?.cash ?? 0),
  mobile: digits(day?.mobile ?? 0),
  other: digits(day?.other ?? 0),
  note: day?.note ?? "",
  counted: digits(day?.counted ?? 0),
  credits: day?.credits.map((l) => ({ name: l.name, amount: String(l.amount) })) ?? [],
  collects: day?.collects.map((l) => ({ name: l.name, amount: String(l.amount) })) ?? [],
});

// The rows that carry something, as the API takes them.
export const lines = (rows: DraftLine[]): IShopLine[] =>
  rows.filter((r) => r.name.trim() || num(r.amount)).map((r) => ({ name: r.name.trim(), amount: num(r.amount) }));

export const dayTotals = (d: DayDraft) => {
  const credit = lines(d.credits).reduce((n, l) => n + l.amount, 0);
  const collect = lines(d.collects).reduce((n, l) => n + l.amount, 0);
  return { credit, collect, sales: num(d.cash) + num(d.mobile) + credit, cashIn: num(d.cash) + num(d.other) + collect };
};

// What a person may still pay back in this entry: what the book shows, plus what this day
// already took from them when it is being edited.
export const payable = (khata: IKhataPerson[], editing: IShopDay | null, name: string) => {
  const key = name.trim().toLowerCase();
  const person = khata.find((k) => k.name.toLowerCase() === key);
  const before = editing?.collects.filter((l) => l.name.toLowerCase() === key).reduce((n, l) => n + l.amount, 0) ?? 0;
  return person || before ? (person?.due ?? 0) + before : null;
};

export const dayProblem = (d: DayDraft, khata: IKhataPerson[], editing: IShopDay | null): DayProblem | null => {
  const t = dayTotals(d);
  if (!t.sales && !t.collect && !num(d.other)) return "empty";
  if (lines(d.credits).some((l) => l.amount && !l.name)) return "needName";
  const bad = lines(d.collects).some((l) => {
    const most = payable(khata, editing, l.name);
    return l.amount > 0 && (most === null || l.amount > most);
  });
  return bad ? "badCollect" : null;
};
