import { expect, test, type BrowserContext } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `017${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const post = async <T>(path: string, body: Record<string, unknown>, token?: string): Promise<T> => {
  const response = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return ((await response.json()) as { data: T }).data;
};

type Session = { accessToken: string; refreshToken: string };

const register = (firstName: string, phone: string) =>
  post<Session>("/auth/register", { firstName, lastName: "খান", email: "", phone, password: "pass2026", acceptTerms: true });

const signIn = (context: BrowserContext, baseURL: string, session: Session) =>
  context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL },
    { name: "refreshToken", value: session.refreshToken, url: baseURL },
  ]);

test("an owner adds a member, gives a reset code, and the member resets with it", async ({ page, context, baseURL, browser }) => {
  const owner = await register("আব্দুল", randomPhone());
  const memberPhone = randomPhone();
  await register("রাশেদ", memberPhone);
  const project = await post<{ id: string }>(
    "/projects",
    {
      name: "মিরপুর ভবন",
      kind: "BUILDING",
      ownership: "PERSONAL",
      location: "",
      description: "",
      startDate: "2026-01-15",
      budget: null,
      farmType: "",
      landUnit: "",
      businessType: "",
      categories: ["রড"],
      phases: [],
    },
    owner.accessToken,
  );
  await signIn(context, baseURL!, owner);

  await page.goto(`/projects/${project.id}/members`);
  await page.getByRole("button", { name: "মেম্বার যোগ করুন" }).click();
  await page.locator("#iv-phone").fill(memberPhone);
  await expect(page.getByText("রাশেদ খান — প্রকল্পে অ্যাকাউন্ট আছে")).toBeVisible();
  await page.getByRole("radio", { name: /ম্যানেজার/ }).check();
  await page.getByRole("dialog").getByRole("button", { name: "যোগ করুন" }).click();
  await expect(page.getByText("রাশেদ খান ম্যানেজার হিসেবে যোগ হয়েছেন")).toBeVisible();

  await page.getByRole("button", { name: "রাশেদ খান-এর জন্য পাসওয়ার্ড রিসেট কোড" }).click();
  const shown = page.getByRole("dialog").locator("strong").first();
  await expect(shown).toHaveText(/^\d{3} \d{3}$/);
  const code = (await shown.textContent())!.replace(" ", "");

  // The member, signed out, resets with the code in a separate browser.
  const memberContext = await browser.newContext({ locale: "bn-BD" });
  const member = await memberContext.newPage();
  await member.goto("/forgot-password");
  await member.locator("#fp-phone").fill(memberPhone);
  await member.getByRole("button", { name: "পরের ধাপ" }).click();
  await member.getByRole("button", { name: "কোড পেয়েছি — এগিয়ে যান" }).click();
  await member.locator("#fp-code").fill(code);
  await member.locator("#fp-new").fill("rashed2027");
  await member.locator("#fp-again").fill("rashed2027");
  await member.getByRole("button", { name: "নতুন পাসওয়ার্ড সেট করুন" }).click();
  await expect(member.getByText("পাসওয়ার্ড বদলেছে")).toBeVisible();
  await memberContext.close();

  await page.goto(`/projects/${project.id}/activity`);
  await expect(page.getByText("মালিকের দেওয়া কোড দিয়ে নিজের পাসওয়ার্ড বদলেছেন")).toBeVisible();
  await expect(page.getByText("রাশেদ খান-কে ম্যানেজার হিসেবে যোগ করেছেন")).toBeVisible();
});
