import type { ISale } from "@/types/sales.types";
import { monthBefore } from "./shopLook";

const DAY_MS = 86_400_000;
const monthAfter = (month: string) => {
  const [y = 0, m = 1] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
};

export type CollectionMonth = { month: string; due: number; paid: number; late: number; ahead: boolean };

// The installment report (board ReportCollection), down payments left out: what was due to
// date and what came in, month by month from nine months back to two ahead, per customer,
// and how long the late money has been late.
export const collectionReport = (sales: ISale[], today: string) => {
  const thisMonth = today.slice(0, 7);
  const months: CollectionMonth[] = [];
  let start = thisMonth;
  for (let i = 0; i < 9; i++) start = monthBefore(start);
  for (let m = start, i = 0; i < 12; m = monthAfter(m), i++) months.push({ month: m, due: 0, paid: 0, late: 0, ahead: m >= thisMonth });
  const byMonth = new Map(months.map((m) => [m.month, m]));
  const aging = [0, 0, 0];
  let dueToDate = 0;
  let paidToDate = 0;
  let lateSum = 0;
  let lateCount = 0;

  const customers = sales
    .filter((s) => s.installments > 0)
    .map((s) => {
      let due = 0;
      let paid = 0;
      let late = 0;
      let full = 0;
      let onTime = 0;
      for (const r of s.rows ?? []) {
        const day = r.due.slice(0, 10);
        const bucket = byMonth.get(day.slice(0, 7));
        if (bucket) {
          bucket.due += r.amount;
          bucket.paid += r.paid;
        }
        if (r.paid >= r.amount) {
          full++;
          if (r.paidOn && r.paidOn.slice(0, 10) <= day) onTime++;
        }
        if (day > today) continue;
        due += r.amount;
        paid += r.paid;
        const left = r.amount - r.paid;
        if (left <= 0) continue;
        late += left;
        lateCount++;
        if (bucket) bucket.late += left;
        const days = Math.round((Date.parse(today) - Date.parse(day)) / DAY_MS);
        aging[days <= 30 ? 0 : days <= 60 ? 1 : 2]! += left;
      }
      dueToDate += due;
      paidToDate += paid;
      lateSum += late;
      return { id: s.id, name: s.customer, unit: s.unitName, count: s.installments, full, onTime, due, paid, late };
    });

  const next = months.filter((m) => m.ahead).slice(0, 3);
  return {
    dueToDate,
    paidToDate,
    rate: dueToDate ? (paidToDate / dueToDate) * 100 : 0,
    lateSum,
    lateCount,
    latePeople: customers.filter((c) => c.late > 0).length,
    nextThree: next.reduce((n, m) => n + Math.max(0, m.due - m.paid), 0),
    nextFrom: next[0]?.month ?? thisMonth,
    nextTo: next.at(-1)?.month ?? thisMonth,
    months,
    customers,
    aging,
  };
};
