// Mirrors prokolpo-backend's internal/phone: Bangladeshi mobile numbers stored as 01XXXXXXXXX.

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

// Accepts the ways people type a number (+880 1712-345678, ০১৭১২ ৩৪৫৬৭৮, 8801712345678).
export const normalizePhone = (raw: string): string | null => {
  let digits = raw.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d))).replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
};

// "01712345678" -> "01712-345678", as the boards print numbers.
export const displayPhone = (phone: string) => (/^\d{11}$/.test(phone) ? `${phone.slice(0, 5)}-${phone.slice(5)}` : phone);
