import { z } from "@/lib/zod";

// Bounds copy the API's rules so the form refuses what the API would. Update both together.
export const loginFormZodSchema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email")),
  password: z.string().min(8, "At least 8 characters"),
});
export type ILoginFormValues = z.infer<typeof loginFormZodSchema>;

export const loginServerZodSchema = loginFormZodSchema.transform((v) => ({ email: v.email.toLowerCase(), password: v.password }));
