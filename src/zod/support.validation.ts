import type messages from "../../messages/bn.json";
import { z } from "@/lib/zod";
import { SUPPORT_TOPICS } from "@/types/support.types";
import { phoneSchema } from "./auth.validation";

// Mirrors prokolpo-backend's support request rules.
type SupportValidationMessages = (typeof messages)["Support"]["validation"];

export const supportRequestSchema = (m: SupportValidationMessages) =>
  z.object({
    name: z.string().trim().min(2, m.name).max(60, m.name),
    phone: phoneSchema(m.phone),
    email: z
      .string()
      .trim()
      .refine((v) => v === "" || z.email().safeParse(v).success, m.email),
    topic: z.enum(SUPPORT_TOPICS),
    source: z.enum(["public", "forgot", "suspended", "app"]),
    message: z.string().trim().min(10, m.message).max(2000, m.message),
  });
export type ISupportFormValues = z.input<ReturnType<typeof supportRequestSchema>>;
