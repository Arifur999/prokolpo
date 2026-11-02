import type messages from "../../messages/bn.json";
import { z } from "@/lib/zod";

// Mirrors prokolpo-backend's bill rules (internal/books/expense_write.go).
type ExpenseValidationMessages = (typeof messages)["ExpenseForm"]["validation"];

const MAX_AMOUNT = 99_999_999_999;

export const expensePayloadSchema = (m: ExpenseValidationMessages) =>
  z
    .object({
      categoryId: z.string().min(1, m.category),
      phaseId: z.string(),
      partyKind: z.enum(["SUPPLIER", "CONTRACTOR", "NONE"]),
      partyId: z.string(),
      date: z.iso.date(),
      quantity: z.string().regex(/^(\d{1,11}(\.\d{1,3})?)?$/, m.quantity),
      unit: z.string().max(20),
      rate: z.number().int().min(0).max(MAX_AMOUNT).nullable(),
      amount: z.number().int().min(1, m.amount).max(MAX_AMOUNT, m.amount),
      description: z.string().trim().max(500),
      paidNow: z.boolean(),
      accountId: z.string(),
      reason: z.string().trim().max(500).optional(),
    })
    .refine((v) => v.partyKind === "NONE" || v.partyId, { message: m.party, path: ["partyId"] });
