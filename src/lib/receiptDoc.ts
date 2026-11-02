import type { IPartnerReceipt } from "@/types/partners.types";
import type { ISaleReceipt } from "@/types/sales.types";
import { banglaWords, englishWords } from "./amountWords";
import { formatDateTime } from "./dhakaTime";
import { dayFirst } from "./expenseText";
import { formatAmount } from "./money";
import { percentText } from "./partnerMath";
import { displayPhone } from "./phone";

// A printed receipt has its own language, whatever the app's is (board ReceiptPartner):
// Bangla, English, or both stacked.
export type DocLang = "bn" | "en" | "both";

const LABELS = {
  bn: {
    title: "টাকা জমার রশিদ",
    no: "নং",
    date: "তারিখ",
    payer: "জমাদাতা",
    unit: "ইউনিট",
    project: "প্রজেক্ট",
    purpose: "বাবদ",
    method: "মাধ্যম",
    amount: "টাকার পরিমাণ",
    words: "কথায়",
    stamp: "জমা হয়েছে",
    price: "বিক্রির দাম",
    should: "দেওয়ার কথা",
    paid: "এ পর্যন্ত মোট জমা",
    due: "বাকি রইল",
    none: "কিছু বাকি নেই",
    next: "পরের কিস্তি",
    share: "পার্টনারের শেয়ার",
    sign: "জমাদাতার স্বাক্ষর",
    receiver: "গ্রহণকারী",
    cust: "কাস্টমারের কপি",
    partner: "পার্টনারের কপি",
    office: "অফিস কপি",
    cut: "এখানে কাটুন",
    brand: "প্রকল্প — প্রজেক্টের হিসাব খাতা",
  },
  en: {
    title: "Money Receipt",
    no: "No.",
    date: "Date",
    payer: "Received from",
    unit: "Unit",
    project: "Project",
    purpose: "Purpose",
    method: "Paid by",
    amount: "Amount",
    words: "In words",
    stamp: "RECEIVED",
    price: "Sale price",
    should: "Committed",
    paid: "Paid so far",
    due: "Balance due",
    none: "Nothing due",
    next: "Next installment",
    share: "Partner share",
    sign: "Payer’s signature",
    receiver: "Received by",
    cust: "Customer copy",
    partner: "Partner copy",
    office: "Office copy",
    cut: "Cut here",
    brand: "Prokolpo — project accounts",
  },
} as const;

export type LabelKey = keyof (typeof LABELS)["bn"];

// A label in the receipt's language; "both" stacks Bangla over English (or joins them inline).
export const docLabel = (lang: DocLang, key: LabelKey, inline = false) =>
  lang === "both" ? `${LABELS.bn[key]}${inline ? " / " : "\n"}${LABELS.en[key]}` : LABELS[lang][key];

export type ReceiptFact = { label: LabelKey; value: string; tone: "ink" | "good" | "due" };

// Everything one copy of a receipt prints, already in its language.
export type ReceiptDoc = {
  no: string;
  date: string;
  company: string;
  companyLine: string;
  payer: string;
  payerSub: string;
  forKey: LabelKey;
  forText: string;
  purpose: string;
  purposeSub: string;
  method: string;
  amount: string;
  words: string;
  receiver: string;
  foot: string;
  copyKey: LabelKey;
  facts: ReceiptFact[];
};

const ROLE = { bn: { OWNER: "মালিক", MANAGER: "ম্যানেজার", VIEWER: "দর্শক" }, en: { OWNER: "Owner", MANAGER: "Manager", VIEWER: "Viewer" } };

// A partner deposit's receipt in a language ("both" prints Bangla text with both labels).
export const partnerReceiptDoc = (r: IPartnerReceipt, lang: DocLang): ReceiptDoc => {
  const bn = lang !== "en";
  const share = percentText(r.share);
  const base = formatAmount(r.totalBase);
  const callDate = r.callDate ? dayFirst(r.callDate) : "";
  const via = r.accountKind === "BANK" ? ` · ${bn ? "ব্যাংক ট্রান্সফার" : "Bank transfer"}` : "";
  const due = r.should - r.paidSoFar;
  const role = r.takenByRole ? ROLE[bn ? "bn" : "en"][r.takenByRole] : "";
  return {
    no: r.no,
    date: dayFirst(r.date.slice(0, 10)),
    company: r.company,
    companyLine: [`${bn ? "প্রজেক্ট: " : "Project: "}${r.project}`, r.location, displayPhone(r.ownerPhone)].filter(Boolean).join(" · "),
    payer: r.payer,
    payerSub: bn ? `পার্টনার · শেয়ার ${share} · মোবাইল ${displayPhone(r.payerPhone)}` : `Partner · ${share} share · Mobile ${displayPhone(r.payerPhone)}`,
    forKey: "project",
    forText: `${r.project}${bn ? " (যৌথ)" : " (joint)"}`,
    purpose: r.callDate ? `${bn ? "ক্যাপিটাল কল " : "Capital call "}${callDate}` : bn ? "মূল প্রতিশ্রুতির টাকা" : "Committed capital",
    purposeSub: r.callDate
      ? `${r.reason ?? ""} · ${bn ? `৳ ${base}-এর ${share}` : `${share} of ৳ ${base}`}`
      : bn
        ? `মোট মূলধন ৳ ${base}-এর ${share}`
        : `${share} of total capital ৳ ${base}`,
    method: `${r.account}${via}${r.note ? ` · ${r.note}` : ""}`,
    amount: `৳ ${formatAmount(r.amount)}`,
    words: lang === "en" ? englishWords(r.amount) : lang === "both" ? `${banglaWords(r.amount)}\n${englishWords(r.amount)}` : banglaWords(r.amount),
    receiver: role ? `${r.takenBy} (${role})` : r.takenBy,
    foot: `${bn ? "কম্পিউটারে তৈরি রশিদ · অ্যাপে লেখা " : "Computer-generated receipt · entered "}${formatDateTime(new Date(r.writtenAt))}`,
    copyKey: "partner",
    facts: [
      { label: "should", value: `৳ ${formatAmount(r.should)}`, tone: "ink" },
      { label: "paid", value: `৳ ${formatAmount(r.paidSoFar)}`, tone: "good" },
      { label: "due", value: due > 0 ? `৳ ${formatAmount(due)}` : docLabel(lang, "none", true), tone: due > 0 ? "due" : "good" },
      { label: "share", value: share, tone: "ink" },
    ],
  };
};

const FLOOR_BN = (n: number) =>
  `${String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯".charAt(Number(d)))}${({ 1: "ম", 2: "য়", 3: "য়", 4: "র্থ", 5: "ম", 6: "ষ্ঠ" } as Record<number, string>)[n] ?? "তম"} তলা`;
const UNIT_TYPE = {
  bn: { FLAT: "ফ্ল্যাট", SHOP: "দোকান", PARKING: "পার্কিং", PLOT: "প্লট", OTHER: "অন্যান্য" },
  en: { FLAT: "Flat", SHOP: "Shop", PARKING: "Parking", PLOT: "Plot", OTHER: "Other" },
};

// A sale payment's receipt in a language (board Receipt): the unit, which installments it
// paid, and what is next.
export const saleReceiptDoc = (r: ISaleReceipt, lang: DocLang): ReceiptDoc => {
  const bn = lang !== "en";
  const covered = r.covered ?? [];
  const nos = covered.map((c) => c.no).join(", ");
  const due = r.price - r.paidSoFar;
  const role = r.takenByRole ? ROLE[bn ? "bn" : "en"][r.takenByRole] : "";
  const via = r.accountKind === "BANK" ? ` · ${bn ? "ব্যাংক ট্রান্সফার" : "Bank transfer"}` : "";
  const firstCovered = covered[0];
  return {
    no: r.no,
    date: dayFirst(r.date.slice(0, 10)),
    company: r.company,
    companyLine: [`${bn ? "প্রজেক্ট: " : "Project: "}${r.project}`, r.location, displayPhone(r.ownerPhone)].filter(Boolean).join(" · "),
    payer: r.payer,
    payerSub: `${bn ? "মোবাইল " : "Mobile "}${displayPhone(r.payerPhone)}`,
    forKey: "unit",
    forText: [r.unit, bn ? FLOOR_BN(r.floor) : `Floor ${r.floor}`, r.size ? `${r.size} sqft` : UNIT_TYPE[bn ? "bn" : "en"][r.unitType]].join(" · "),
    purpose:
      r.kind === "DOWN"
        ? r.installments
          ? bn
            ? "ডাউনপেমেন্ট"
            : "Down payment"
          : bn
            ? "পুরো দাম"
            : "Full price"
        : `${bn ? "কিস্তি " : "Installment "}${nos}/${r.installments}`,
    purposeSub:
      r.kind === "DOWN"
        ? bn
          ? "বিক্রির দিন জমা"
          : "Paid on the day of sale"
        : firstCovered
          ? `${bn ? "দেওয়ার তারিখ " : "Due date "}${dayFirst(firstCovered.due.slice(0, 10))}`
          : "",
    method: `${r.account}${via}${r.note ? ` · ${r.note}` : ""}`,
    amount: `৳ ${formatAmount(r.amount)}`,
    words: lang === "en" ? englishWords(r.amount) : lang === "both" ? `${banglaWords(r.amount)}\n${englishWords(r.amount)}` : banglaWords(r.amount),
    receiver: role ? `${r.takenBy} (${role})` : r.takenBy,
    foot: `${bn ? "কম্পিউটারে তৈরি রশিদ · অ্যাপে লেখা " : "Computer-generated receipt · entered "}${formatDateTime(new Date(r.writtenAt))}`,
    copyKey: "cust",
    facts: [
      { label: "price", value: `৳ ${formatAmount(r.price)}`, tone: "ink" },
      { label: "paid", value: `৳ ${formatAmount(r.paidSoFar)}`, tone: "good" },
      { label: "due", value: due > 0 ? `৳ ${formatAmount(due)}` : docLabel(lang, "none", true), tone: due > 0 ? "due" : "good" },
      {
        label: "next",
        value: r.next ? `${bn ? "কিস্তি " : "Installment "}${r.next.no} · ${dayFirst(r.next.date.slice(0, 10))}` : "—",
        tone: "ink",
      },
    ],
  };
};
