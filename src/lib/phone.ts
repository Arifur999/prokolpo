// Mirrors prokolpo-backend's internal/phone: Bangladeshi mobile numbers stored as 01XXXXXXXXX.

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

// Accepts the ways people type a number (+880 1712-345678, ০১৭১২ ৩৪৫৬৭৮, 8801712345678).
export const normalizePhone = (raw: string): string | null => {
  let digits = raw.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d))).replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
};
