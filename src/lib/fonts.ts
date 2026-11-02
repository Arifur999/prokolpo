import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

// Body and UI text. globals.css maps --font-sans to Tailwind's `font-sans`.
export const bodyFont = Hind_Siliguri({
  variable: "--font-sans",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Headings, the logo mark and big figures (`font-heading`).
export const displayFont = Noto_Serif_Bengali({
  variable: "--font-display",
  subsets: ["bengali", "latin"],
  weight: ["600", "700"],
  display: "swap",
});
