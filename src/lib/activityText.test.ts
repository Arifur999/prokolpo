import { describe, expect, it } from "vitest";
import messages from "../../messages/bn.json";
import type { IActivityItem } from "@/types/members.types";
import { activityLine, changeRow, type Translate } from "./activityText";

// A tiny stand-in for next-intl's t over the real Bangla messages.
const t: Translate = (key, values = {}) => {
  const text = key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages.Activity);
  return String(text).replace(/\{(\w+)\}/g, (_, name: string) => String(values[name]));
};

const item = (overrides: Partial<IActivityItem>) =>
  ({
    action: "CREATE",
    entity: "expense",
    summary: "",
    changes: [],
    reason: null,
    details: {},
    title: null,
    quantity: null,
    unit: null,
    amount: null,
    party: null,
    account: null,
    otherAccount: null,
    purpose: null,
    note: null,
    phase: null,
    paidNow: false,
    deleted: false,
    ...overrides,
  }) as IActivityItem;

describe("activity lines", () => {
  it("words a bill with its quantity, how it was paid, party and phase", () => {
    const line = activityLine(
      item({ title: "সিমেন্ট", quantity: "50.000", unit: "বস্তা", amount: 26000, paidNow: true, party: "মেসার্স রহমান সিমেন্ট", phase: "৩য় তলা" }),
      t,
    );
    expect(line).toEqual({ area: "খরচ", text: "সিমেন্ট · 50 বস্তা যোগ করেছেন — ৳ 26,000", sub: "নগদে কেনা · মেসার্স রহমান সিমেন্ট · ৩য় তলা" });
  });

  it("calls a wage payment wages and names the account", () => {
    const line = activityLine(item({ entity: "payment", party: "হাসান লেবার দল", amount: 13000, purpose: "WAGE", account: "বিকাশ" }), t);
    expect(line.text).toBe("হাসান লেবার দল-কে ৳ 13,000 মজুরি দিয়েছেন");
    expect(line.sub).toBe("বিকাশ থেকে · সাপ্তাহিক মজুরি");
  });

  it("gives a deletion its reason and a transfer both accounts", () => {
    expect(activityLine(item({ action: "DELETE", title: "ট্রাক ভাড়া", amount: 3500, reason: "দুইবার লেখা" }), t)).toMatchObject({
      text: "একটা খরচ মুছেছেন — ট্রাক ভাড়া · ৳ 3,500",
      sub: "কারণ: দুইবার লেখা",
    });
    expect(activityLine(item({ entity: "transfer", account: "ডাচ্-বাংলা ব্যাংক", otherAccount: "বিকাশ", amount: 30000 }), t).text).toBe(
      "ডাচ্-বাংলা ব্যাংক থেকে বিকাশ-তে ৳ 30,000 সরিয়েছেন",
    );
  });

  it("shows an edit's money and dates the way the books do", () => {
    expect(changeRow({ field: "rate", before: "94000", after: "95000" }, t)).toEqual({ label: "দর", before: "৳ 94,000", after: "৳ 95,000" });
    expect(changeRow({ field: "date", before: "2026-09-30", after: "2026-10-01" }, t)).toEqual({ label: "তারিখ", before: "30/09/2026", after: "01/10/2026" });
    expect(changeRow({ field: "quantity", before: "5.000 টন", after: " " }, t)).toEqual({ label: "পরিমাণ", before: "5 টন", after: "—" });
  });

  it("words team changes from their details", () => {
    expect(activityLine(item({ entity: "invite", summary: "01633221100", details: { role: "VIEWER" } }), t).text).toBe(
      "01633-221100 নম্বরকে দর্শক হিসেবে আমন্ত্রণ দিয়েছেন",
    );
    expect(activityLine(item({ entity: "member", action: "UPDATE", summary: "রাশেদ খান", details: { role: "VIEWER", from: "MANAGER" } }), t).text).toBe(
      "রাশেদ খান-এর রোল বদলেছেন — ম্যানেজার থেকে দর্শক",
    );
    expect(activityLine(item({ entity: "something-new", summary: "x" }), t)).toMatchObject({ area: "অন্যান্য", text: "x" });
  });

  it("words farm sales, batches and the shop's day book", () => {
    expect(activityLine(item({ entity: "produce", summary: "মামুন পোল্ট্রি", details: { amount: "295680", left: "12000" } }), t)).toEqual({
      area: "উৎপাদন বিক্রি",
      text: "মামুন পোল্ট্রি-এর কাছে বিক্রি লিখেছেন — ৳ 2,95,680",
      sub: "বাকি ৳ 12,000",
    });
    expect(activityLine(item({ entity: "batch", action: "UPDATE", summary: "৪র্থ ব্যাচ", details: { ended: "2026-08-24" } }), t).text).toBe(
      "৪র্থ ব্যাচ শেষ করেছেন",
    );
    expect(activityLine(item({ entity: "shop_day", action: "UPDATE", summary: "2026-10-03", details: { amount: "16850" } }), t).text).toBe(
      "03/10/2026-এর হিসাব এডিট করেছেন — বিক্রি ৳ 16,850",
    );
    expect(activityLine(item({ entity: "khata_payment", summary: "সেলিম মিস্ত্রি", details: { amount: "3000" } }), t).area).toBe("বাকির খাতা");
  });

  it("words settings changes by their section", () => {
    const settings = (summary: string, details: Record<string, string>) => item({ entity: "settings", action: "UPDATE", summary, details });
    expect(activityLine(settings("মিরপুর ভবন", { section: "general", status: "DONE", from: "ACTIVE" }), t)).toEqual({
      area: "সেটিংস",
      text: "প্রজেক্টের অবস্থা করেছেন: শেষ",
      sub: "",
    });
    expect(activityLine(settings("লিফট", { section: "categoryAdd" }), t).text).toBe("নতুন খাত যোগ করেছেন: লিফট");
    expect(activityLine(settings("72", { section: "supportOn", hours: "72" }), t).text).toBe("সাপোর্টকে 72 ঘণ্টা প্রজেক্ট দেখার অনুমতি দিয়েছেন");
    expect(activityLine(settings("রাশেদ খান", { section: "owner" }), t).text).toBe("রাশেদ খান-কে মালিক করেছেন — নিজে এখন ম্যানেজার");
  });
});
