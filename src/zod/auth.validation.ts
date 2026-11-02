import type messages from "../../messages/bn.json";
import { normalizePhone } from "@/lib/phone";
import { z } from "@/lib/zod";

// Rules copy prokolpo-backend's auth validation so the form refuses what the API would.
// Messages come in from next-intl (useTranslations in forms, getTranslations in actions).
export type AuthValidationMessages = Record<keyof (typeof messages)["Auth"]["validation"], string>;

const PASSWORD_RULE = /^(?=.*\p{L})(?=.*\p{N}).{8,128}$/u;

export const passwordSchema = (m: AuthValidationMessages) => z.string().regex(PASSWORD_RULE, m.passwordWeak);

export const phoneSchema = (m: AuthValidationMessages) =>
  z
    .string()
    .refine((raw) => normalizePhone(raw) !== null, m.phoneBad)
    .transform((raw) => normalizePhone(raw) ?? raw);

// ---- login

export const loginFormSchema = (m: AuthValidationMessages) =>
  z.object({
    identifier: z.string().trim().min(1, m.identifierMissing),
    password: z.string().min(1, m.passwordMissing),
    remember: z.boolean(),
  });
export type ILoginFormValues = z.input<ReturnType<typeof loginFormSchema>>;

// ---- registration

// A blank name gets only "enter your name", not the length message too.
const requiredName = (missing: string, long: string) => z.string().trim().min(1, { message: missing, abort: true }).max(30, long);

export const registerFormSchema = (m: AuthValidationMessages) =>
  z
    .object({
      companyName: z
        .string()
        .trim()
        .refine((v) => v === "" || v.length >= 2, m.companyShort)
        .refine((v) => v.length <= 80, m.companyLong),
      firstName: requiredName(m.firstMissing, m.firstLong).min(2, m.firstShort),
      lastName: requiredName(m.lastMissing, m.lastLong),
      email: z
        .string()
        .trim()
        .refine((v) => v === "" || z.email().safeParse(v).success, m.emailBad),
      phone: phoneSchema(m),
      password: passwordSchema(m),
      confirmPassword: z.string(),
      acceptTerms: z.boolean().refine((v) => v, m.termsMissing),
    })
    .refine((v) => v.confirmPassword === v.password, { path: ["confirmPassword"], message: m.confirmMismatch })
    .transform((v) => ({
      companyName: v.companyName,
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      password: v.password,
      acceptTerms: v.acceptTerms,
    }));
export type IRegisterFormValues = z.input<ReturnType<typeof registerFormSchema>>;

// ---- password reset

export const forgotPhoneSchema = (m: AuthValidationMessages) => z.object({ phone: phoneSchema(m) });

export const newPasswordSchema = (m: AuthValidationMessages) =>
  z
    .object({ password: passwordSchema(m), confirmPassword: z.string() })
    .refine((v) => v.confirmPassword === v.password, { path: ["confirmPassword"], message: m.confirmMismatch });
export type INewPasswordValues = z.input<ReturnType<typeof newPasswordSchema>>;
