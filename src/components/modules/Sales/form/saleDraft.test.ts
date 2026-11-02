import { describe, expect, it } from "vitest";
import { blankSale, saleErrors, salePayload } from "./saleDraft";

const today = "2026-10-03";

describe("sale draft", () => {
  it("needs a buyer, a price, and installments after the sale day", () => {
    const d = blankSale(today, "u1", 5_500_000, "a1");
    expect(saleErrors(d, today)).toEqual({ name: "required", phone: "invalid" });
    const filled = { ...d, customer: { name: "নাসরিন আক্তার", phone: "01712-998877", nid: "", address: "" }, down: "5500000" };
    expect(saleErrors(filled, today)).toEqual({ down: "invalid" });
    expect(saleErrors({ ...filled, down: "1800000", firstDue: today }, today)).toEqual({ firstDue: "invalid" });
  });

  it("sends a full-price sale as no installments", () => {
    const d = { ...blankSale(today, "u1", 2_800_000, "a1"), plan: "FULL" as const, mode: "OLD" as const, customerId: "c1" };
    expect(saleErrors(d, today)).toEqual({});
    expect(salePayload(d)).toMatchObject({ customerId: "c1", price: 2_800_000, down: 2_800_000, installments: 0, firstDue: "" });
  });

  it("normalises the new buyer's number", () => {
    const d = { ...blankSale(today, "u1", 5_400_000, "a1"), customer: { name: " নাসরিন ", phone: "+8801712998877", nid: "", address: "" }, down: "3360000" };
    expect(salePayload(d).customer).toMatchObject({ name: "নাসরিন", phone: "01712998877" });
  });
});
