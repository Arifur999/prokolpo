import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `016${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const post = async <T>(path: string, body: Record<string, unknown>, token?: string): Promise<T> => {
  const response = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return ((await response.json()) as { data: T }).data;
};

test("an owner adds partners, makes a capital call, and a deposit prints its receipt", async ({ page, context, baseURL }) => {
  const ownerPhone = randomPhone();
  const session = await post<{ accessToken: string; refreshToken: string }>("/auth/register", {
    firstName: "আব্দুল",
    lastName: "করিম",
    email: "",
    phone: ownerPhone,
    password: "karim2026",
    acceptTerms: true,
  });
  const project = await post<{ id: string }>(
    "/projects",
    {
      name: "মিরপুর ভবন",
      kind: "BUILDING",
      ownership: "PARTNERSHIP",
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
    session.accessToken,
  );
  await context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL! },
    { name: "refreshToken", value: session.refreshToken, url: baseURL! },
  ]);

  await page.goto(`/projects/${project.id}/partners`);
  await page.getByRole("button", { name: "নতুন পার্টনার" }).click();
  await page.locator("#np-phone").fill(ownerPhone);
  await expect(page.getByText(/প্রজেক্টের মেম্বার — আব্দুল করিম/)).toBeVisible();
  await page.locator("#np-commit").fill("8000000");
  await page.getByRole("dialog").getByRole("button", { name: "পার্টনার যোগ করুন" }).click();
  await expect(page.getByText("আব্দুল করিম পার্টনার হয়েছেন — 100% শেয়ার · বাকিদের শেয়ার নতুন হারে")).toBeVisible();

  await page.getByRole("button", { name: "নতুন পার্টনার" }).click();
  await page.locator("#np-phone").fill(randomPhone());
  await page.locator("#np-name").fill("তানিয়া রহমান");
  await page.locator("#np-share").fill("20");
  await page.locator("#np-commit").fill("2000000");
  await expect(page.getByRole("dialog").getByText("80%", { exact: true })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "পার্টনার যোগ করুন" }).click();
  await expect(page.getByText(/তানিয়া রহমান পার্টনার হয়েছেন — 20% শেয়ার/)).toBeVisible();

  await page.getByRole("button", { name: "নতুন ক্যাপিটাল কল" }).first().click();
  await page.locator("#call-amount").fill("1000000");
  await page.locator("#call-reason").fill("ছাদ ঢালাই");
  await page.getByRole("button", { name: "ক্যাপিটাল কল তৈরি করুন" }).click();
  await expect(page.getByText("ক্যাপিটাল কল তৈরি হয়েছে — ৳ 10,00,000")).toBeVisible();
  await expect(page.getByText("ছাদ ঢালাই")).toBeVisible();

  await page.getByRole("button", { name: "তানিয়া রহমান-এর টাকা জমা নিন" }).click();
  await page.getByRole("button", { name: /পুরো বাকি/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "৳ 22,00,000 জমা নিন" }).click();
  await expect(page).toHaveURL(/\/receipts\/.+\/deposits\//);
  await expect(page.getByRole("heading", { name: /রশিদ PRK-000001/ })).toBeVisible();
  await expect(page.getByText("বাইশ লক্ষ টাকা মাত্র").first()).toBeVisible();
});
