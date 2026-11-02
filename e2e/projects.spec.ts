import { expect, test, type BrowserContext } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `018${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

// Signs a fresh account in by putting its tokens in the browser, as the login action would.
const signIn = async (context: BrowserContext, baseURL: string) => {
  const response = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName: "আব্দুল", lastName: "করিম", email: "", phone: randomPhone(), password: "karim2026", acceptTerms: true }),
  });
  const { data } = (await response.json()) as { data: { accessToken: string; refreshToken: string } };
  await context.addCookies([
    { name: "accessToken", value: data.accessToken, url: baseURL },
    { name: "refreshToken", value: data.refreshToken, url: baseURL },
  ]);
};

test("a new building project opens on its overview and shows on the dashboard", async ({ page, context, baseURL }) => {
  // Saving compiles the overview on a cold dev server.
  test.setTimeout(60_000);
  await signIn(context, baseURL!);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "এখনো কোনো প্রজেক্ট নেই" })).toBeVisible();

  await page.getByRole("link", { name: /যৌথ প্রজেক্ট খুলুন/ }).click();
  await expect(page.getByRole("radio", { name: /যৌথ/ })).toBeChecked();

  // The name is checked before anything is sent.
  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page.getByText("প্রজেক্টের নাম দিন")).toBeVisible();

  await page.locator("#np-name").fill("মিরপুর ৬ তলা ভবন");
  await page.locator("#np-budget").fill("25000000");
  await expect(page.getByText("2 কোটি 50 লাখ টাকা")).toBeVisible();
  await page.getByRole("button", { name: "এক তলা বাড়ান" }).click();
  await page.getByRole("button", { name: "এক তলা বাড়ান" }).click();
  await expect(page.getByText("ধাপ (7টা)")).toBeVisible();

  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\?created$/, { timeout: 30_000 });
  await expect(page.getByText("প্রজেক্ট তৈরি হয়েছে — মিরপুর ৬ তলা ভবন")).toBeVisible();
  await expect(page.getByRole("heading", { name: "তলা অনুযায়ী বাজেট" })).toBeVisible();
  await expect(page.getByText("২য় তলা")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: "মিরপুর ৬ তলা ভবন" })).toBeVisible();
});

test("an owner deletes a project and brings it back", async ({ page, context, baseURL }) => {
  await signIn(context, baseURL!);
  await page.goto("/projects/new");
  await page.getByRole("radio", { name: /খামার/ }).check();
  await page.locator("#np-name").fill("সাভার পোল্ট্রি খামার");
  await page.getByRole("button", { name: "প্রজেক্ট তৈরি করুন" }).click();
  await expect(page).toHaveURL(/\?created$/);

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "সাভার পোল্ট্রি খামার — আরও অপশন" }).click();
  await page.getByRole("menuitem", { name: "মুছে ফেলুন" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "মুছে ফেলুন" }).click();

  await expect(page.getByRole("heading", { name: "এখন কোনো চালু প্রজেক্ট নেই" })).toBeVisible();
  await page.getByRole("button", { name: "ফিরিয়ে আনুন" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "ফিরিয়ে আনুন" }).click();
  await expect(page.getByRole("link", { name: "সাভার পোল্ট্রি খামার" })).toBeVisible();
});
