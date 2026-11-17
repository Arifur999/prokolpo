import { expect, test, type BrowserContext } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `018${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

// Signs a fresh account in by putting its tokens in the browser, as the login action would.
const signIn = async (context: BrowserContext, baseURL: string) => {
  const phone = randomPhone();
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "আব্দুল",
      lastName: "করিম",
      companyName: "করিম বিল্ডার্স",
      email: "",
      phone,
      password: "karim2026",
      acceptTerms: true,
    }),
  });
  const { data } = (await response.json()) as { data: { accessToken: string; refreshToken: string } };
  await context.addCookies([
    { name: "accessToken", value: data.accessToken, url: baseURL },
    { name: "refreshToken", value: data.refreshToken, url: baseURL },
  ]);
  return phone;
};

test("a new building project opens a manager's login and shows on the dashboard", async ({ page, context, baseURL }) => {
  test.setTimeout(60_000);
  await signIn(context, baseURL!);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "এখনো কোনো প্রজেক্ট নেই" })).toBeVisible();

  await page.getByRole("link", { name: /যৌথ প্রজেক্ট খুলুন/ }).click();
  await expect(page.getByRole("radio", { name: /যৌথ/ })).toBeChecked();

  // Nothing is sent until the name, the address and the manager's details are there.
  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page.getByText("প্রজেক্টের নাম দিন")).toBeVisible();
  await expect(page.getByText("প্রজেক্টের ঠিকানা দিন")).toBeVisible();
  await expect(page.getByText("ম্যানেজারের নাম দিন")).toBeVisible();

  await page.locator("#np-name").fill("মিরপুর ৬ তলা ভবন");
  await page.locator("#np-location").fill("মিরপুর-১০, ঢাকা");
  await page.getByRole("button", { name: "এক তলা বাড়ান" }).click();
  await page.getByRole("button", { name: "এক তলা বাড়ান" }).click();
  await expect(page.getByText("ধাপ (7টা)")).toBeVisible();

  const managerPhone = randomPhone();
  await page.locator("#np-mgr-name").fill("জসিম উদ্দিন");
  await page.locator("#np-mgr-phone").fill(managerPhone);
  await page.getByRole("button", { name: "নিজে থেকে বানান" }).click();
  const password = await page.locator("#np-mgr-pass").inputValue();
  expect(password).toMatch(/^(?=.*\d)[a-z0-9]{8}$/);
  await expect(page.getByText("আপনি মালিক, জসিম উদ্দিন ম্যানেজার")).toBeVisible();

  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page.getByText("প্রজেক্ট তৈরি হয়েছে — মিরপুর ৬ তলা ভবন · ম্যানেজারের লগইন চালু")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("status").filter({ hasText: "ম্যানেজারের লগইন তৈরি হয়েছে" })).toContainText(password);

  await page.getByRole("link", { name: "প্রজেক্টে যান" }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/);
  await expect(page.getByText("২য় তলা")).toBeVisible();

  // The card numbers the project, names the company and shows its manager.
  await page.goto("/dashboard");
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "মিরপুর ৬ তলা ভবন" }) });
  await expect(card.getByText("প্রজেক্ট 1", { exact: true })).toBeVisible();
  await expect(card.getByText("করিম বিল্ডার্স")).toBeVisible();
  await expect(card.getByText("নতুন", { exact: true })).toBeVisible();
  await expect(card.getByText("প্রজেক্ট ম্যানেজার")).toBeVisible();
  await expect(card.getByText("জসিম উদ্দিন")).toBeVisible();
  await card.getByRole("link", { name: "মিরপুর ৬ তলা ভবন — প্রজেক্ট খুলুন" }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/);

  // The manager signs in with what the owner handed over, and sees only this project.
  const login = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: managerPhone, password, remember: false }),
  });
  const { data } = (await login.json()) as { data: { accessToken: string } };
  const projects = await fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${data.accessToken}` } });
  const { data: list } = (await projects.json()) as { data: { name: string; role: string }[] };
  expect(list).toEqual([expect.objectContaining({ name: "মিরপুর ৬ তলা ভবন", role: "MANAGER" })]);
});

test("a manager number that already has an account is refused on its field", async ({ page, context, baseURL }) => {
  const ownPhone = await signIn(context, baseURL!);
  await page.goto("/projects/new");
  await page.locator("#np-name").fill("উত্তরা ফ্ল্যাট");
  await page.locator("#np-location").fill("সেক্টর ৭, উত্তরা");
  await page.locator("#np-mgr-name").fill("রাকিব হাসান");
  await page.locator("#np-mgr-phone").fill(ownPhone);
  await page.locator("#np-mgr-pass").fill("rakib1");
  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page.locator("#np-mgr-phone-msg")).toHaveText("এই নম্বরে আগে থেকেই অ্যাকাউন্ট আছে — মেম্বার পেজ থেকে আমন্ত্রণ দিন");
  await expect(page.locator("#np-mgr-phone")).toHaveAttribute("aria-invalid", "true");
});

test("an owner deletes a project and brings it back", async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!);
  await page.goto("/projects/new");
  await page.getByRole("radio", { name: /খামার/ }).check();
  await page.locator("#np-name").fill("সাভার পোল্ট্রি খামার");
  await page.locator("#np-location").fill("হেমায়েতপুর, সাভার");
  await page.getByRole("radio", { name: /আপাতত শুধু আমি/ }).check();
  await expect(page.getByText("শুধু আপনি — মালিক")).toBeVisible();
  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page.getByRole("link", { name: "প্রজেক্টে যান" })).toBeVisible();

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "সাভার পোল্ট্রি খামার — আরও অপশন" }).click();
  await page.getByRole("menuitem", { name: "মুছে ফেলুন" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "মুছে ফেলুন" }).click();

  await expect(page.getByRole("heading", { name: "এখন কোনো চালু প্রজেক্ট নেই" })).toBeVisible();
  await page.getByRole("button", { name: "ফিরিয়ে আনুন" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "ফিরিয়ে আনুন" }).click();
  await expect(page.getByRole("link", { name: "সাভার পোল্ট্রি খামার — প্রজেক্ট খুলুন" })).toBeVisible();
});
