import { expect, test, type Page } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

// A fresh number per account keeps runs independent of each other and of old data.
const randomPhone = () => `017${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

type Account = { phone: string; password: string; email?: string };

// Registering through the API is faster than the form when the form is not what a test checks.
const registerViaApi = async (account: Account) => {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "তানিয়া",
      lastName: "রহমান",
      email: account.email ?? "",
      phone: account.phone,
      password: account.password,
      acceptTerms: true,
    }),
  });
  expect(response.status).toBe(201);
};

const fillRegistration = async (page: Page, phone: string) => {
  await page.locator("#rg-first").fill("আব্দুল");
  await page.locator("#rg-last").fill("করিম");
  await page.locator("#rg-phone").fill(phone);
  await page.locator("#rg-pass").fill("karim2026");
  await page.locator("#rg-pass2").fill("karim2026");
  await page.getByRole("checkbox").check();
};

test("registering signs in and opens the dashboard", async ({ page, context }) => {
  await page.goto("/register");
  await fillRegistration(page, randomPhone());
  await page.getByRole("button", { name: "অ্যাকাউন্ট খুলুন" }).click();

  await expect(page).toHaveURL(/\/dashboard(\?welcome)?$/);
  const cookies = await context.cookies();
  expect(cookies.map((cookie) => cookie.name)).toEqual(expect.arrayContaining(["accessToken", "refreshToken"]));
});

test("registering with a used number shows the API's error on the phone field", async ({ page }) => {
  const phone = randomPhone();
  await registerViaApi({ phone, password: "tania2026" });

  await page.goto("/register");
  await fillRegistration(page, phone);
  await page.getByRole("button", { name: "অ্যাকাউন্ট খুলুন" }).click();

  await expect(page.locator("#rg-phone-msg")).toHaveText("এই নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে");
  await expect(page).toHaveURL(/\/register$/);
});

test("login refuses a wrong password, then accepts the right one", async ({ page }) => {
  const account = { phone: randomPhone(), password: "tania2026" };
  await registerViaApi(account);

  await page.goto("/login");
  await page.locator("#login-id").fill(account.phone);
  await page.locator("#login-pass").fill("wrong-pass1");
  await page.getByRole("button", { name: "লগইন করুন" }).click();
  await expect(page.getByText("মোবাইল নম্বর/ইমেইল বা পাসওয়ার্ড মেলেনি")).toBeVisible();

  await page.locator("#login-pass").fill(account.password);
  await page.getByRole("button", { name: "লগইন করুন" }).click();
  await expect(page).toHaveURL(/\/dashboard(\?welcome)?$/);
});

test("forgot password emails a reset link", async ({ page }) => {
  const account = { phone: randomPhone(), password: "tania2026", email: `tania.${Date.now()}@example.com` };
  await registerViaApi(account);

  await page.goto("/forgot-password");
  await page.locator("#fp-phone").fill(account.phone);
  await page.getByRole("button", { name: "পরের ধাপ" }).click();
  await expect(page.getByRole("heading", { name: "কীভাবে নতুন পাসওয়ার্ড দেবেন?" })).toBeVisible();

  await page.getByRole("button", { name: "ইমেইলে লিংক পাঠান" }).click();
  await expect(page.getByRole("heading", { name: "ইমেইল দেখুন" })).toBeVisible();
});

test("a support request gets a reference number", async ({ page }) => {
  const phone = randomPhone();
  await page.goto(`/support?from=forgot&phone=${phone}`);
  await expect(page.locator("#su-phone")).toHaveValue(phone);

  await page.locator("#su-name").fill("তানিয়া রহমান");
  await page.locator("#su-msg").fill("পাসওয়ার্ড মনে নেই, অ্যাকাউন্টে ইমেইলও দেওয়া নেই।");
  await page.getByRole("button", { name: "অনুরোধ পাঠান" }).click();

  await expect(page.getByText(/অনুরোধ নম্বর S-\d+/)).toBeVisible();
});
