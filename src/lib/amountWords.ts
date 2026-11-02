// A receipt's amount in words, in the receipt's own language whatever the app's language
// is ("তেত্রিশ লক্ষ ষাট হাজার" / "Thirty-Three Lakh Sixty Thousand").
const BN =
  "শূন্য এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ এগারো বারো তেরো চৌদ্দ পনেরো ষোলো সতেরো আঠারো উনিশ বিশ একুশ বাইশ তেইশ চব্বিশ পঁচিশ ছাব্বিশ সাতাশ আটাশ ঊনত্রিশ ত্রিশ একত্রিশ বত্রিশ তেত্রিশ চৌত্রিশ পঁয়ত্রিশ ছত্রিশ সাঁইত্রিশ আটত্রিশ ঊনচল্লিশ চল্লিশ একচল্লিশ বিয়াল্লিশ তেতাল্লিশ চুয়াল্লিশ পঁয়তাল্লিশ ছেচল্লিশ সাতচল্লিশ আটচল্লিশ ঊনপঞ্চাশ পঞ্চাশ একান্ন বাহান্ন তিপ্পান্ন চুয়ান্ন পঞ্চান্ন ছাপ্পান্ন সাতান্ন আটান্ন ঊনষাট ষাট একষট্টি বাষট্টি তেষট্টি চৌষট্টি পঁয়ষট্টি ছেষট্টি সাতষট্টি আটষট্টি ঊনসত্তর সত্তর একাত্তর বাহাত্তর তিয়াত্তর চুয়াত্তর পঁচাত্তর ছিয়াত্তর সাতাত্তর আটাত্তর ঊনআশি আশি একাশি বিরাশি তিরাশি চুরাশি পঁচাশি ছিয়াশি সাতাশি আটাশি ঊননব্বই নব্বই একানব্বই বিরানব্বই তিরানব্বই চুরানব্বই পঁচানব্বই ছিয়ানব্বই সাতানব্বই আটানব্বই নিরানব্বই".split(
    " ",
  );
const ONES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

type Scale = { crore: string; lakh: string; thousand: string; hundred: (word: string) => string; under100: (n: number) => string };

const BN_SCALE: Scale = { crore: "কোটি", lakh: "লক্ষ", thousand: "হাজার", hundred: (w) => `${w}শত`, under100: (n) => BN[n] ?? "" };
const EN_SCALE: Scale = {
  crore: "Crore",
  lakh: "Lakh",
  thousand: "Thousand",
  hundred: (w) => `${w} Hundred`,
  under100: (n) => (n < 20 ? (ONES[n] ?? "") : `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${ONES[n % 10]}` : ""}`),
};

const inWords = (amount: number, s: Scale): string => {
  let n = Math.floor(amount);
  if (n === 0) return s.under100(0);
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  if (crore) parts.push(`${crore < 100 ? s.under100(crore) : inWords(crore, s)} ${s.crore}`);
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  if (lakh) parts.push(`${s.under100(lakh)} ${s.lakh}`);
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand) parts.push(`${s.under100(thousand)} ${s.thousand}`);
  const hundred = Math.floor(n / 100);
  n %= 100;
  if (hundred) parts.push(s.hundred(s.under100(hundred)));
  if (n) parts.push(s.under100(n));
  return parts.join(" ");
};

export const banglaWords = (amount: number) => `${inWords(amount, BN_SCALE)} টাকা মাত্র`;
export const englishWords = (amount: number) => `${inWords(amount, EN_SCALE)} Taka Only`;
