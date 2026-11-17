import { describe, expect, it } from "vitest";
import bn from "../../messages/bn.json";
import { loginFormSchema, newPasswordSchema, registerFormSchema } from "./auth.validation";

const m = bn.Auth.validation;

const validRegistration = {
  firstName: " আব্দুল করিম ",
  companyName: "করিম বিল্ডার্স",
  email: "",
  phone: "+880 1712-345678",
  password: "karim2026",
  confirmPassword: "karim2026",
  acceptTerms: true,
};

const messagesOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]));

describe("registerFormSchema", () => {
  it("normalises the phone and drops the confirmation", () => {
    const result = registerFormSchema(m).safeParse(validRegistration);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      companyName: "করিম বিল্ডার্স",
      firstName: "আব্দুল করিম",
      lastName: "",
      email: "",
      phone: "01712345678",
      password: "karim2026",
      acceptTerms: true,
    });
  });

  it("reports the design's message for every broken rule", () => {
    const result = registerFormSchema(m).safeParse({
      companyName: "ক",
      firstName: "আ",
      email: "not-an-email",
      phone: "12345",
      password: "short",
      confirmPassword: "short",
      acceptTerms: false,
    });
    expect(messagesOf(result)).toMatchObject({
      companyName: m.companyShort,
      firstName: m.firstShort,
      email: m.emailBad,
      phone: m.phoneBad,
      password: m.passwordWeak,
      acceptTerms: m.termsMissing,
    });
  });

  it("asks a builder for their company but not someone joining by invitation", () => {
    const blank = { ...validRegistration, companyName: "" };
    expect(messagesOf(registerFormSchema(m).safeParse(blank))).toEqual({ companyName: m.companyMissing });
    expect(registerFormSchema(m, { invited: true }).safeParse(blank).success).toBe(true);
  });

  it("flags a confirmation that does not match", () => {
    const result = registerFormSchema(m).safeParse({ ...validRegistration, confirmPassword: "karim2027" });
    expect(messagesOf(result)).toEqual({ confirmPassword: m.confirmMismatch });
  });
});

describe("loginFormSchema", () => {
  it("requires both fields", () => {
    const result = loginFormSchema(m).safeParse({ identifier: " ", password: "", remember: true });
    expect(messagesOf(result)).toEqual({ identifier: m.identifierMissing, password: m.passwordMissing });
  });
});

describe("newPasswordSchema", () => {
  it("accepts Bangla letters with digits", () => {
    expect(newPasswordSchema(m).safeParse({ password: "নতুনপাস2026", confirmPassword: "নতুনপাস2026" }).success).toBe(true);
  });
});
