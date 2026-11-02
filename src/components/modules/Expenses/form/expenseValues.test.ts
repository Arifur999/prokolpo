import { describe, expect, it } from "vitest";
import { amountOf, autoAmount, blankExpense, cleanQuantity, expenseErrors, toPayload } from "./expenseValues";

const base = blankExpense("2026-10-03", "sup-1", "cash-1");

describe("expense values", () => {
  it("cleans quantities, Bangla digits included", () => {
    expect(cleanQuantity("৫.২৫০৯")).toBe("5.250");
    expect(cleanQuantity("1,000 টন")).toBe("1000");
  });

  it("works the total out from quantity and rate until it is typed", () => {
    const v = { ...base, quantity: "5", rate: "95000" };
    expect(autoAmount(v)).toBe(475000);
    expect(amountOf(v)).toBe(475000);
    expect(amountOf({ ...v, amount: "470000", amountManual: true })).toBe(470000);
  });

  it("needs an amount, a category and the chosen party", () => {
    expect(expenseErrors({ ...base, supplierId: "" })).toEqual({ amount: true, categoryId: true, partyId: true });
    expect(expenseErrors({ ...base, categoryId: "c", amount: "10", amountManual: true })).toEqual({});
  });

  it("sends the account only when paid now", () => {
    const v = { ...base, categoryId: "c", amount: "10", amountManual: true };
    expect(toPayload(v)).toMatchObject({ partyKind: "SUPPLIER", partyId: "sup-1", accountId: "", unit: "", quantity: "" });
    expect(toPayload({ ...v, paidNow: true }).accountId).toBe("cash-1");
  });
});

describe("valuesFromExpense", () => {
  it("treats a total that matches quantity × rate as worked out", async () => {
    const { valuesFromExpense } = await import("./expenseValues");
    const bill = {
      categoryId: "c",
      quantity: "5.000",
      unit: "টন",
      rate: 95000,
      amount: 475000,
      supplierId: "s",
      contractorId: null,
      phaseId: null,
      date: "2026-10-01",
      description: null,
      paidNow: false,
    };
    expect(valuesFromExpense(bill as never)).toMatchObject({ quantity: "5", amountManual: false, partyKind: "SUPPLIER" });
    expect(valuesFromExpense({ ...bill, amount: 470000 } as never).amountManual).toBe(true);
  });
});
