import { expect, test } from "@playwright/test";

const API = process.env.E2E_API_URL ?? "http://localhost:5000/api/v1";

const randomPhone = () => `015${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;

const post = async <T>(path: string, body: Record<string, unknown>, token?: string): Promise<T> => {
  const response = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return ((await response.json()) as { data: T }).data;
};

test("a flat sold on installments shows in sales, takes a payment and prints its receipt", async ({ page, context, baseURL }) => {
  // A sale, a payment and a receipt: three cold routes on a dev server.
  test.setTimeout(60_000);
  const session = await post<{ accessToken: string; refreshToken: string }>("/auth/register", {
    firstName: "আব্দুল",
    lastName: "করিম",
    email: "",
    phone: randomPhone(),
    password: "karim2026",
    acceptTerms: true,
  });
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
    session.accessToken,
  );
  await post(`/projects/${project.id}/units`, { units: [{ name: "ফ্ল্যাট ৩-বি", type: "FLAT", floor: 3, size: 950, price: 5_500_000 }] }, session.accessToken);
  await context.addCookies([
    { name: "accessToken", value: session.accessToken, url: baseURL! },
    { name: "refreshToken", value: session.refreshToken, url: baseURL! },
  ]);

  await page.goto(`/projects/${project.id}/units`);
  await page.getByRole("button", { name: /ফ্ল্যাট ৩-বি, খালি/ }).click();
  await page.getByRole("link", { name: "এই ইউনিট বিক্রি করুন" }).click();
  await expect(page.getByRole("heading", { name: "নতুন বিক্রি", level: 1 })).toBeVisible();

  await page.locator("#c-name").fill("নাসরিন আক্তার");
  await page.locator("#c-phone").fill(randomPhone());
  await page.locator("#s-price").fill("5400000");
  await page.locator("#s-down").fill("3360000");
  await expect(page.getByText("৳ 85,000").first()).toBeVisible();
  await page.getByText("সেভের পর ডাউনপেমেন্টের রশিদ প্রিন্ট করুন").click();
  await page.getByRole("button", { name: "বিক্রি সেভ করুন" }).click();

  await expect(page).toHaveURL(/\/sales\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: /ফ্ল্যাট ৩-বি · নাসরিন আক্তার/ })).toBeVisible();
  await page.getByRole("button", { name: "কিস্তি জমা নিন" }).click();
  await page.getByRole("button", { name: /2টা কিস্তি/ }).click();
  await expect(page.getByText("৳ 85,000 — পুরো শোধ").first()).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "৳ 1,70,000 জমা নিন" }).click();

  await expect(page).toHaveURL(/\/receipts\/.+\/payments\//);
  await expect(page.getByRole("heading", { name: /রশিদ PRK-000002/ })).toBeVisible();
  await expect(page.getByText("কিস্তি 1, 2/24").first()).toBeVisible();
  await expect(page.getByText("এক লক্ষ সত্তর হাজার টাকা মাত্র").first()).toBeVisible();
});
