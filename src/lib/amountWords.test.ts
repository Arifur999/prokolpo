import { describe, expect, it } from "vitest";
import { banglaWords, englishWords } from "./amountWords";

describe("amount in words", () => {
  it("writes taka in Bangla with lakh and crore", () => {
    expect(banglaWords(3_360_000)).toBe("তেত্রিশ লক্ষ ষাট হাজার টাকা মাত্র");
    expect(banglaWords(400_000)).toBe("চার লক্ষ টাকা মাত্র");
    expect(banglaWords(12_00_00_250)).toBe("বারো কোটি দুইশত পঞ্চাশ টাকা মাত্র");
  });

  it("writes taka in English with lakh and crore", () => {
    expect(englishWords(3_360_000)).toBe("Thirty-Three Lakh Sixty Thousand Taka Only");
    expect(englishWords(85_000)).toBe("Eighty-Five Thousand Taka Only");
  });
});
